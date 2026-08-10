/* Hey Palo Alto — weekly digest sender.
 * Runs in GitHub Actions (see digest-workflow-COPY-ME.txt), Sundays ~5pm Pacific.
 * Reads civic-data.json + stakes.js from the repo checkout, matches the coming
 * week's agenda items (and last week's discussions) against each confirmed
 * subscriber's criteria (topics ∪ keywords), and sends one brand-styled email
 * per subscriber via Resend. Quiet week for a subscriber → no email (MK's call).
 *
 * Env (GitHub secrets): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY,
 *                       FUNCTIONS_BASE_URL (https://<ref>.supabase.co/functions/v1)
 * Optional: DRY_RUN=1 (log, don't send), POSTAL_ADDRESS (CAN-SPAM footer line).
 * No new npm deps — plain fetch only. No Math.random (site convention).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://heypaloalto.org";
const FROM = "Hey Palo Alto <hello@heypaloalto.org>";
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, FUNCTIONS_BASE_URL, POSTAL_ADDRESS } = process.env;
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

if (!DRY_RUN && (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY || !FUNCTIONS_BASE_URL)) {
  console.error("Missing env (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / RESEND_API_KEY / FUNCTIONS_BASE_URL)");
  process.exit(1);
}

/* ---------- load data ---------- */
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "civic-data.json"), "utf8"));
let STAKES = { mode: "off", lines: {} };
try {
  STAKES = JSON.parse(fs.readFileSync(path.join(ROOT, "stakes.js"), "utf8").replace(/^window\.STAKES\s*=\s*/, "").replace(/;\s*$/, ""));
} catch { /* headlines optional */ }
const stakesKey = t => (t || "").toLowerCase().replace(/\s+/g, " ").trim().slice(0, 140);
const headline = title => { const e = STAKES.mode === "live" && STAKES.lines[stakesKey(title)]; return e && e.ok && e.s ? e.s : null; };

/* ---------- date windows (America/Los_Angeles) ---------- */
const laToday = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
laToday.setHours(0, 0, 0, 0);
const day = 864e5;
const inWindow = (iso, from, to) => { const d = new Date(iso + "T12:00:00"); return d >= from && d < to; };
const nextWeek = m => inWindow(m.date, laToday, new Date(+laToday + 8 * day));       // today..+7d inclusive
const lastWeek = m => inWindow(m.date, new Date(+laToday - 7 * day), laToday);        // -7d..yesterday

/* ---------- matching ---------- */
const matches = (item, sub) =>
  (item.topics || []).some(t => sub.topics.includes(t)) ||
  sub.keywords.some(k => item.title.toLowerCase().includes(k.toLowerCase()));

function collect(sub) {
  const pick = filter => data.meetings.filter(filter).map(m => ({
    m, items: (m.items || []).filter(i => matches(i, sub))
  })).filter(x => x.items.length).sort((a, b) => a.m.date < b.m.date ? -1 : 1);
  return { coming: pick(nextWeek), discussed: pick(lastWeek) };
}

/* ---------- email HTML ---------- */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const prettyDate = iso => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
const prettyTime = t => { const m = /^(\d{1,2}):(\d{2})/.exec(t || ""); if (!m) return ""; const h = +m[1]; return `${((h + 11) % 12) + 1}:${m[2]} ${h < 12 ? "a.m." : "p.m."}`; };

function meetingBlock({ m, items }, kind) {
  const when = kind === "coming"
    ? `${prettyDate(m.date)}${m.startTime ? " · " + prettyTime(m.startTime) : ""}`
    : `discussed ${prettyDate(m.date)}`;
  const links = [
    m.agendaUrl ? `<a href="${m.agendaUrl}" style="color:#0a5c37">Official agenda</a>` : "",
    m.videoId ? `<a href="https://www.youtube.com/watch?v=${m.videoId}" style="color:#0a5c37">Meeting video</a>` : "",
  ].filter(Boolean).join(" · ");
  const rows = items.map(i => {
    const h = headline(i.title);
    return `<tr><td style="padding:10px 0;border-bottom:1px solid #e3ebe1">
      ${h ? `<div style="font-weight:bold;font-size:15px;line-height:1.35">${esc(h)}</div>
             <div style="font-size:12.5px;color:#5a6b5c;margin-top:3px">Official item: ${esc(i.title)}</div>`
          : `<div style="font-weight:bold;font-size:15px;line-height:1.35">${esc(i.title)}</div>`}
    </td></tr>`;
  }).join("");
  return `<div style="margin:18px 0 26px">
    <div style="font-size:13px;font-weight:bold;color:#0e7c4a;text-transform:uppercase;letter-spacing:.04em">${esc(m.body)} — ${when}</div>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    ${links ? `<div style="font-size:13px;margin-top:8px">${links}</div>` : ""}
  </div>`;
}

function buildEmail(sub, { coming, discussed }) {
  const chips = [...sub.topics, ...sub.keywords].map(c =>
    `<span style="display:inline-block;background:#eef3e8;color:#0a5c37;border-radius:999px;padding:3px 10px;margin:2px;font-size:12px">${esc(c)}</span>`).join("");
  const unsub = `${FUNCTIONS_BASE_URL}/unsubscribe?t=${sub.unsub_token}`;
  const nComing = coming.reduce((s, x) => s + x.items.length, 0);
  const subject = nComing
    ? `This week in Palo Alto: ${nComing} item${nComing > 1 ? "s" : ""} you follow ${nComing > 1 ? "are" : "is"} up`
    : `Palo Alto update: what happened on your issues last week`;
  const html = `<div style="font-family:Georgia,'Times New Roman',serif;max-width:600px;margin:0 auto;color:#17251c;padding:8px">
    <div style="background:#0a5c37;border-radius:14px;padding:18px 22px;color:#fff">
      <div style="font-size:21px;font-weight:bold">Hey Palo Alto — your week ahead</div>
      <div style="font-size:13px;opacity:.85;margin-top:4px">Free, independent &amp; non-partisan · matching: ${chips}</div>
    </div>
    ${coming.length ? `<h2 style="color:#0a5c37;font-size:17px;margin:24px 0 4px">🗓 Coming up this week — you can still weigh in</h2>${coming.map(x => meetingBlock(x, "coming")).join("")}` : ""}
    ${discussed.length ? `<h2 style="color:#0a5c37;font-size:17px;margin:24px 0 4px">✔️ Discussed last week</h2>${discussed.map(x => meetingBlock(x, "discussed")).join("")}` : ""}
    <div style="margin:26px 0"><a href="${SITE}" style="background:#dc1f5c;color:#fff;padding:11px 20px;border-radius:10px;text-decoration:none;font-weight:bold">✉️ Weigh in — 2 min at heypaloalto.org</a></div>
    <div style="font-size:12px;color:#5a6b5c;border-top:1px solid #e3ebe1;padding-top:12px;line-height:1.5">
      You subscribed to this weekly digest at heypaloalto.org. Plain-language summaries are AI-generated from the city's published agendas and checked for neutrality; the official item title is always shown. Hey Palo Alto is independent and never endorses candidates, measures, or positions.<br>
      <a href="${unsub}" style="color:#5a6b5c">Unsubscribe with one click</a> · ${esc(POSTAL_ADDRESS || "Hey Palo Alto, Palo Alto, CA")}
    </div></div>`;
  return { subject, html, unsub };
}

/* ---------- supabase REST helpers ---------- */
const sb = (p, init = {}) => fetch(`${SUPABASE_URL}/rest/v1/${p}`, {
  ...init,
  headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json", ...(init.headers || {}) },
});

/* ---------- main ---------- */
const subs = DRY_RUN && !SUPABASE_URL
  ? [{ email: "dry-run@example.com", topics: ["Housing", "Parks & Open Space"], keywords: ["Cubberley"], unsub_token: "00000000-0000-0000-0000-000000000000" }]
  : await (await sb("subscribers?status=eq.confirmed&select=id,email,topics,keywords,unsub_token")).json();

console.log(`Confirmed subscribers: ${subs.length}`);
let sent = 0, skipped = 0, failed = 0;

for (const sub of subs) {
  const found = collect(sub);
  if (!found.coming.length && !found.discussed.length) { skipped++; continue; }
  const { subject, html } = buildEmail(sub, found);
  if (DRY_RUN) {
    console.log(`[dry-run] would send to ${sub.email}: "${subject}" (${found.coming.length} coming / ${found.discussed.length} discussed meetings)`);
    fs.writeFileSync(path.join(ROOT, "digest-preview.html"), html); sent++; continue;
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM, to: [sub.email], subject, html,
      headers: { "List-Unsubscribe": `<${FUNCTIONS_BASE_URL}/unsubscribe?t=${sub.unsub_token}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    }),
  });
  if (r.ok) {
    sent++;
    await sb(`subscribers?id=eq.${sub.id}`, { method: "PATCH", body: JSON.stringify({ last_digest_at: new Date().toISOString() }) });
  } else { failed++; console.error(`send failed for ${sub.email}: ${r.status} ${await r.text()}`); }
  await new Promise(res => setTimeout(res, 600)); // stay far under Resend rate limits
}

console.log(`Done. sent=${sent} quiet-week-skipped=${skipped} failed=${failed}`);
if (failed) process.exit(1);
