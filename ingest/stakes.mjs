#!/usr/bin/env node
/**
 * Hey Palo Alto — plain-language headline ("stakes line") generator
 * ------------------------------------------------------------------
 * Runs after ingest.mjs in the nightly GitHub Action. For each agenda item it
 * drafts ONE neutral, plain-language headline using the Claude API, then a
 * SECOND, independent AI call adversarially checks the draft for neutrality
 * and factual grounding. Only lines that pass the checker (and the local
 * validators below) are ever displayed by the app. The official agenda title
 * is always shown alongside a displayed line.
 *
 * Design rules (agreed with MK, July 2026):
 *  - Strictly non-partisan. The generator may use ONLY facts present in the
 *    agenda item itself; anything unclear → SKIP (the app falls back to the
 *    official title, which is always safe).
 *  - Fixed neutral sentence frames; no dates in the line (the app shows the
 *    meeting date separately); no judgment words; no urgency theatrics.
 *  - Every candidate passes: local validators → adversarial checker → display.
 *  - Failure of ANY kind (no API key, API down, model renamed) must never
 *    break the nightly data refresh: this script always exits 0 and leaves
 *    the previous stakes.js in place.
 *
 * Output:
 *  - ../stakes.js           what the app reads (window.STAKES = {...})
 *  - ../stakes-review.json  full log incl. rejected drafts + reasons (for MK)
 *
 * Run:
 *  node stakes.mjs                     (needs ANTHROPIC_API_KEY in the env)
 *  node stakes.mjs --dry-run           (no network; deterministic mock — for testing)
 *  node stakes.mjs --regen             (regenerate all lines, ignore cache)
 *
 * Kill switch: set MODE to "shadow" below (lines keep generating into the
 * review file but the app displays none), or delete ../stakes.js.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONFIG = {
  MODE: 'live',                 // 'live' = app displays passing lines; 'shadow' = generate + log only
  MODEL: 'claude-haiku-4-5',    // cheapest current Claude model; update if Anthropic renames it
  MAX_NEW_PER_RUN: 80,          // safety cap per night
  MAX_LINE_CHARS: 110,
  API_URL: 'https://api.anthropic.com/v1/messages',
};

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, '..');
const DRY_RUN = process.argv.includes('--dry-run');
const REGEN = process.argv.includes('--regen');
const API_KEY = process.env.ANTHROPIC_API_KEY || '';

/* ---------- data loading ---------- */

function loadCivicData() {
  const jsonPath = join(OUT_DIR, 'civic-data.json');
  if (existsSync(jsonPath)) return JSON.parse(readFileSync(jsonPath, 'utf8'));
  const jsPath = join(OUT_DIR, 'civic-data.js');
  if (existsSync(jsPath)) {
    const raw = readFileSync(jsPath, 'utf8');
    const m = raw.match(/window\.CIVIC_DATA\s*=\s*([\s\S]*?);?\s*$/);
    if (m) return JSON.parse(m[1].replace(/;\s*$/, ''));
  }
  return null;
}

function loadExistingStakes() {
  const p = join(OUT_DIR, 'stakes.js');
  if (!existsSync(p)) return null;
  const m = readFileSync(p, 'utf8').match(/window\.STAKES\s*=\s*([\s\S]*?);?\s*$/);
  try { return m ? JSON.parse(m[1].replace(/;\s*$/, '')) : null; } catch { return null; }
}

/* Same normalization as the app's stakesKey() — keep in sync. */
function stakesKey(t) { return (t || '').toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 140); }

/* ---------- local validators (cheap, deterministic, run on every draft) ---------- */

const BANNED = /(!|should|must|deserve|finally|sadly|alarming|exciting|shocking|huge|massive|drastic|controversial|radical|extreme|threat|promis|danger|crisis|outrage|landmark|historic step|long overdue|common.?sense|reckless|generous|greedy)/i;

function validateLocally(line) {
  if (!line || line === 'SKIP') return 'skip';
  if (line.length > CONFIG.MAX_LINE_CHARS) return `too long (${line.length})`;
  if (BANNED.test(line)) return `banned pattern: ${line.match(BANNED)[0]}`;
  if (/[?]$/.test(line)) return 'rhetorical question';
  if (!/^[A-Z“"]/.test(line)) return 'must start with a capital';
  return null; // passes
}

/* ---------- prompts ---------- */

function generatorPrompt(item) {
  return `You write one-line plain-language headlines for a strictly NON-PARTISAN civic information site in Palo Alto, CA. Residents of every political view must find the line fair.

THE AGENDA ITEM (your ONLY source of facts — use nothing else):
- Body: ${item.body}
- Official item title: ${item.title}

RULES (all mandatory):
1. Use only facts stated in the item above. If the title is too vague or procedural to restate plainly, output SKIP.
2. One sentence, maximum ${CONFIG.MAX_LINE_CHARS} characters. Present tense. No date (it is shown separately).
3. Use one of these neutral frames (adapt the ⟨what⟩ only):
   - "The ⟨body⟩ decides ⟨what⟩."
   - "The ⟨body⟩ reviews ⟨what⟩."
   - "The ⟨body⟩ considers ⟨what⟩."
   - "⟨What⟩ goes before the ⟨body⟩."
   - "⟨What⟩ is up for a public hearing."
4. Neutral verbs only (decides, reviews, considers, sets, updates, votes on). NO judgment words (important, controversial, exciting, overdue, huge), no urgency words, no exclamation marks, no questions, no winners or losers, no adjectives of size or virtue.
5. Never imply an outcome is good, bad, likely, or deserved. Never name whose "fault" or "win" anything is.
6. Plain 8th-grade words: say "garbage rates" not "refuse rate schedule adjustments" — but only if the item itself supports it.

Respond with STRICT JSON only: {"line": "..."} or {"line": "SKIP"}.`;
}

function checkerPrompt(item, line) {
  return `You are an adversarial reviewer for a strictly NON-PARTISAN civic information site. Your default is to REJECT.

OFFICIAL AGENDA ITEM: "${item.title}" (body: ${item.body})
CANDIDATE HEADLINE: "${line}"

Reject (ok=false) unless BOTH hold:
1. GROUNDED: every fact in the headline is directly supported by the official item text above — nothing added, nothing exaggerated, no interpretation of intent or outcome.
2. NEUTRAL: no reasonable Palo Alto resident — of any political view, on any side of local debates (housing, policing, budgets, schools) — could read the headline as favoring a side, outcome, or group. Also reject drama, urgency, or emotional coloring.

Respond with STRICT JSON only: {"ok": true} or {"ok": false, "reason": "..."}.`;
}

/* ---------- Claude API (or deterministic mock in --dry-run) ---------- */

async function callClaude(prompt) {
  if (DRY_RUN) return mockClaude(prompt);
  const res = await fetch(CONFIG.API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: CONFIG.MODEL,
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return (data.content && data.content[0] && data.content[0].text || '').trim();
}

/* Deterministic offline mock so the whole pipeline is testable without a key.
   Items whose title contains "TEST-REJECT" exercise the rejection path. */
function mockClaude(prompt) {
  if (prompt.includes('adversarial reviewer')) {
    return prompt.includes('TEST-REJECT') ? '{"ok": false, "reason": "mock rejection"}' : '{"ok": true}';
  }
  const body = (prompt.match(/- Body: (.*)/) || [])[1] || 'City Council';
  const title = ((prompt.match(/- Official item title: (.*)/) || [])[1] || '').replace(/[."]+$/, '');
  let what = title.replace(/^(public hearing[:&\s]*|recommendation (to|on)\s*|adopt(ion of)?\s*|approv(e|al of)\s*|resolution\s*)/i, '').trim();
  if (!what) return '{"line": "SKIP"}';
  if (!(what.length > 1 && what[1] === what[1].toUpperCase() && /[A-Z]/.test(what[1]))) what = what.charAt(0).toLowerCase() + what.slice(1);
  let line = `The ${body} considers ${what}`;
  if (line.length > CONFIG.MAX_LINE_CHARS) line = line.slice(0, CONFIG.MAX_LINE_CHARS - 1).replace(/\s+\S*$/, '');
  return JSON.stringify({ line: line + '.' });
}

function parseJson(text) {
  try { return JSON.parse(text); } catch {}
  const m = text.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

/* ---------- main ---------- */

async function main() {
  if (!DRY_RUN && !API_KEY) {
    console.log('stakes.mjs: no ANTHROPIC_API_KEY set — skipping headline generation (this is fine; the app shows official titles).');
    return;
  }
  const data = loadCivicData();
  if (!data || !Array.isArray(data.meetings)) {
    console.log('stakes.mjs: no civic-data found — run ingest.mjs first. Skipping.');
    return;
  }

  // Collect unique agenda items (the app turns each item into an issue keyed by title).
  const items = new Map();
  for (const m of data.meetings) {
    for (const it of (m.items || [])) {
      const key = stakesKey(it.title);
      if (key && !items.has(key)) items.set(key, { title: it.title, body: m.body || 'City Council' });
    }
  }

  const prev = REGEN ? null : loadExistingStakes();
  const lines = (prev && prev.lines) ? { ...prev.lines } : {};
  const review = [];
  let created = 0, rejected = 0, skipped = 0, kept = 0, errors = 0;

  for (const [key, item] of items) {
    if (lines[key]) { kept++; continue; }
    if (created + rejected + skipped >= CONFIG.MAX_NEW_PER_RUN) break;
    try {
      const gen = parseJson(await callClaude(generatorPrompt(item)));
      const line = gen && typeof gen.line === 'string' ? gen.line.trim() : 'SKIP';
      const localFail = validateLocally(line);
      if (localFail) {
        skipped++;
        review.push({ key, title: item.title, draft: line, verdict: localFail === 'skip' ? 'model skipped' : `local validator: ${localFail}` });
        continue;
      }
      const chk = parseJson(await callClaude(checkerPrompt(item, line)));
      if (chk && chk.ok === true) {
        lines[key] = { s: line, ok: true, body: item.body };
        created++;
        review.push({ key, title: item.title, draft: line, verdict: 'PASSED — will display' });
      } else {
        rejected++;
        review.push({ key, title: item.title, draft: line, verdict: `checker rejected: ${(chk && chk.reason) || 'no/invalid checker response'}` });
      }
    } catch (e) {
      errors++;
      review.push({ key, title: item.title, verdict: `error: ${String(e.message).slice(0, 160)}` });
      if (errors >= 5) { console.log('stakes.mjs: too many API errors — stopping early, keeping previous lines.'); break; }
    }
  }

  // Drop lines for items no longer in the data (agendas rotate).
  let retired = 0;
  for (const key of Object.keys(lines)) if (!items.has(key)) { delete lines[key]; retired++; }

  const payload = { mode: CONFIG.MODE, generatedAt: new Date().toISOString(), lines };
  writeFileSync(join(OUT_DIR, 'stakes.js'), 'window.STAKES = ' + JSON.stringify(payload) + ';');
  writeFileSync(join(OUT_DIR, 'stakes-review.json'), JSON.stringify({
    generatedAt: payload.generatedAt, mode: CONFIG.MODE, dryRun: DRY_RUN,
    stats: { items: items.size, newLines: created, kept, rejectedByChecker: rejected, skippedOrFailedValidation: skipped, retired, errors },
    log: review,
  }, null, 2));
  console.log(`stakes.mjs: ${created} new line(s), ${kept} kept, ${rejected} rejected by checker, ${skipped} skipped, ${retired} retired, ${errors} error(s). Mode: ${CONFIG.MODE}${DRY_RUN ? ' (dry-run)' : ''}.`);
}

main().catch(e => { console.log('stakes.mjs: unexpected error — skipping without failing the workflow:', e.message); });
