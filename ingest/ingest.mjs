#!/usr/bin/env node
/**
 * Palo Alto Civic Pulse — agenda ingest
 * --------------------------------------
 * Pulls EVERY Palo Alto public body's meetings (City Council + all commissions
 * and committees) for a window of the past 6 months through the next 6 months,
 * straight from the city's official PrimeGov portal, and writes a normalized
 * data file the app reads.
 *
 * Data sources (all public, no key required):
 *   - Meeting list:  GET /api/v2/PublicPortal/ListArchivedMeetings?year=YYYY
 *                    GET /api/v2/PublicPortal/ListUpcomingMeetings
 *   - Agenda items:  GET /Portal/Meeting?meetingTemplateId=NNNN   (server-rendered HTML)
 *                    parsed via the .meeting-item / .number-cell / .agenda-item
 *                    and .section-row CSS structure.
 *   - Video:         the meeting's YouTube recording (videoUrl on the meeting object).
 *
 * Output:
 *   - civic-data.json   canonical, normalized data
 *   - civic-data.js     same data as `window.CIVIC_DATA = {...}` for the file:// app
 *
 * Run:
 *   cd ingest && npm install   (installs cheerio)
 *   node ingest.mjs            (writes ../civic-data.json and ../civic-data.js)
 *
 * Notes:
 *   - Time estimates come from the agenda's published section headers
 *     ("ACTION ITEMS (Item 16: 8:20 - 9:20 PM)"). They are the city's own
 *     estimates and are approximate — the app labels them as a guide, not a
 *     transcript timestamp.
 *   - Be polite: a small delay is inserted between agenda fetches.
 */

import { load } from 'cheerio';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://cityofpaloalto.primegov.com';
const MONTHS_BACK = 6;
const MONTHS_FWD  = 6;
const FETCH_DELAY_MS = 250;          // politeness between agenda-page fetches
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ----------------------------------------------------------------------- *
 * Body display config: friendly names, slugs, contact email for "email
 * your officials". Council uses its official public-comment address; other
 * bodies fall back to the City Clerk, which routes public comment.
 * ----------------------------------------------------------------------- */
const CLERK = 'city.clerk@PaloAlto.gov';
const BODY_CONTACTS = {
  'City Council': 'city.council@PaloAlto.gov',
};
function bodyEmail(name){ return BODY_CONTACTS[name] || CLERK; }
function slug(s){ return s.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }

/* Simple, transparent keyword → topic tagging so issues stay filterable.
   Order matters only for display; an item can match several topics. */
const TOPIC_RULES = [
  ['Housing',              /housing|rezon|sb\s?79|tenant|rent|adu|dwelling|prohousing|residential/i],
  ['Transportation',       /transport|bike|pedestrian|parking|rail|grade separation|caltrain|traffic|street|crossing|transit|parklet/i],
  ['Climate & Utilities',  /utilit|electric|gas|water|wastewater|refuse|stormwater|rate|energy|climate|sustainab|solar/i],
  ['Crime, Policing, and Public Safety', /police|safety|fire|auditor|license plate|flock|emergency|crime/i],
  ['Parks & Open Space',   /park|open space|trail|preserve|recreation|tree|creek/i],
  ['Historic Preservation',/historic|preservation|heritage/i],
  ['Arts & Culture',       /art|mural|cultural|museum|library/i],
  ['Budget & Taxes',       /budget|fee|tax|fund|contract|purchase order|appropriat|financial|reserve/i],
  ['Downtown & Business',  /downtown|business|retail|california ave|university ave|economic|vitality|commercial/i],
];
function topicsFor(title){
  const t = TOPIC_RULES.filter(([,re]) => re.test(title)).map(([name]) => name);
  return t.length ? t : ['Other'];
}
const cleanText = s => (s || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();

/* Local news RSS feeds. Palo Alto Online (Weekly) topic feeds + Palo Alto Daily Post.
   (The Daily News / Mercury feed is bot-blocked, so it's intentionally omitted.) */
const NEWS_FEEDS = [
  { source: 'Palo Alto Online',     url: 'https://www.paloaltoonline.com/category/city-politics/feed/' },
  { source: 'Palo Alto Online',     url: 'https://www.paloaltoonline.com/category/land-use/feed/' },
  { source: 'Palo Alto Online',     url: 'https://www.paloaltoonline.com/category/housing/feed/' },
  { source: 'Palo Alto Online',     url: 'https://www.paloaltoonline.com/category/business/feed/' },
  { source: 'Palo Alto Daily Post', url: 'https://padailypost.com/category/palo-alto/feed/' },
];
async function getTextAbs(url){
  const r = await fetch(url, { headers: { Accept: 'application/rss+xml, text/xml, */*' } });
  if (!r.ok) throw new Error(`${r.status} for ${url}`);
  return r.text();
}
async function fetchNews(){
  const out = [], seen = new Set();
  for (const f of NEWS_FEEDS) {
    try {
      const $ = load(await getTextAbs(f.url), { xmlMode: true });
      $('item').each((_, it) => {
        const $it = $(it);
        const title = cleanText($it.find('title').first().text());
        const link  = cleanText($it.find('link').first().text());
        const cats  = $it.find('category').map((_, c) => $(c).text()).get();
        if (cats.some(c => /CalMatters|National|^State/i.test(c))) return;   // drop syndicated/non-local
        if (!title || !link || seen.has(link)) return; seen.add(link);
        const d = new Date($it.find('pubDate').first().text() || Date.now());
        const summary = cleanText($it.find('description').first().text()).slice(0, 180);
        out.push({ title, source: f.source, date: d.toISOString().slice(0, 10), url: link,
                   topics: topicsFor(title + ' ' + summary), summary });
      });
      await sleep(FETCH_DELAY_MS);
    } catch (e) { console.warn(`  ! news feed failed (${f.url}): ${e.message}`); }
  }
  // keep only items that match a real topic; newest first; cap the list
  return out
    .filter(n => n.topics.length && !(n.topics.length === 1 && n.topics[0] === 'Other'))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 40);
}

/* ----------------------------------------------------------------------- *
 * Community events — paloalto.gov/Events-Directory (OpenCities).
 * Official meetings are EXCLUDED here (they come from PrimeGov above and
 * live on the app's Calendar page); holidays/closures are skipped too.
 * Pagination: ?dlv_OC%20CL%20Public%20Events%20Listing=(pageindex=N),
 * 10 <article> cards per page. Canceled events carry a "Canceled" title
 * prefix in the directory markup. Never throws — worst case returns [].
 * ----------------------------------------------------------------------- */
const EVENTS_BASE = 'https://www.paloalto.gov';
const EVENTS_MAX_PAGES = 15;      // safety cap; loop stops when a page repeats or is empty
const EVENTS_DAYS_AHEAD = 60;
const EVENT_SKIP_TAGS = /Council Meetings|Commissions Meetings|Other City Meetings|City Holiday/i;
async function fetchEvents(){
  const out = [], seen = new Set();
  const horizon = new Date(); horizon.setDate(horizon.getDate() + EVENTS_DAYS_AHEAD);
  let prevFirst = null;
  for (let p = 1; p <= EVENTS_MAX_PAGES; p++) {
    let $;
    try {
      $ = load(await getTextAbs(`${EVENTS_BASE}/Events-Directory?dlv_OC%20CL%20Public%20Events%20Listing=(pageindex=${p})`));
    } catch (e) { console.warn(`  ! events page ${p} failed: ${e.message}`); break; }
    const arts = $('article');
    if (!arts.length) break;
    const first = cleanText(arts.first().find('.list-item-title').text());
    if (first && first === prevFirst) break;               // pagination wrapped around
    prevFirst = first;
    arts.each((_, el) => {
      const $a = $(el);
      const title = cleanText($a.find('.list-item-title').first().text());
      if (!title || /^Canceled/i.test(title)) return;      // canceled events: title prefix in markup
      if (/\bMeeting\b/i.test(title)) return;              // meeting stragglers without tags
      const tags = $a.find('.tagged-as-list .text').text().split(',').map(s => s.trim()).filter(Boolean);
      if (tags.some(t => EVENT_SKIP_TAGS.test(t))) return;
      const when = new Date(`${cleanText($a.find('.part-date').text())} ${cleanText($a.find('.part-month').text())} ${cleanText($a.find('.part-year').text())} 12:00`);
      if (isNaN(when) || when > horizon) return;           // next N days only
      let url = ($a.find('a').first().attr('href') || '').split('?')[0];
      if (url.startsWith('/')) url = EVENTS_BASE + url;
      const date = when.toISOString().slice(0, 10);
      if (seen.has(title + '|' + date)) return; seen.add(title + '|' + date);
      const more = (cleanText($a.find('.published-on').first().text()).match(/(\d+) more date/) || [])[1];
      out.push({
        title, date,
        desc: cleanText($a.find('.list-item-block-desc').first().text()).slice(0, 200),
        where: cleanText($a.find('.list-item-address').first().text()).replace(/,?\s*(Palo Alto)?\s*,?\s*(CA)?\s*(9\d{4})?\s*$/i, '').replace(/,\s*$/, '').trim(),
        moreDates: more ? +more : 0,
        tags, url,
      });
    });
    await sleep(FETCH_DELAY_MS);
  }
  /* Second pass: real start/end times live on each event's DETAIL page
     (.multi-date-item rows, or the "Next date:" .event-date header).
     City pages only — external listings (e.g. the zoo) stay all-day.
     Any failure just leaves the event timeless; never fails the run. */
  const to24 = (h, mm, ap) => {
    let H = parseInt(h, 10) % 12; if (/PM/i.test(ap)) H += 12;
    return String(H).padStart(2, '0') + ':' + mm;
  };
  for (const e of out) {
    if (!e.url.startsWith(EVENTS_BASE)) continue;
    try {
      const $ = load(await getTextAbs(e.url));
      const want = new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      let txt = '';
      $('.multi-date-item').each((_, el) => { const t = cleanText($(el).text()); if (!txt && t.includes(want)) txt = t; });
      if (!txt) txt = cleanText($('.event-date').first().text());
      const m = txt.match(/(\d{1,2}):(\d{2})\s*([AP]M)\s*(?:to|-|–)\s*(\d{1,2}):(\d{2})\s*([AP]M)/i);
      if (m) { e.start = to24(m[1], m[2], m[3]); e.end = to24(m[4], m[5], m[6]); }
      await sleep(FETCH_DELAY_MS);
    } catch (err) { console.warn(`  ! event time fetch failed (${e.title}): ${err.message}`); }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

/* ----------------------------------------------------------------------- *
 * Date window
 * ----------------------------------------------------------------------- */
const today = new Date();
const lo = new Date(today); lo.setMonth(lo.getMonth() - MONTHS_BACK);
const hi = new Date(today); hi.setMonth(hi.getMonth() + MONTHS_FWD);
const inWindow = iso => { const d = new Date(iso + 'T12:00:00'); return d >= lo && d <= hi; };
const yearsNeeded = [...new Set([lo.getFullYear(), today.getFullYear(), hi.getFullYear()])];

/* ----------------------------------------------------------------------- *
 * Fetch helpers
 * ----------------------------------------------------------------------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJSON(path){
  const r = await fetch(BASE + path, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`${r.status} for ${path}`);
  return r.json();
}
async function getHTML(path){
  const r = await fetch(BASE + path, { headers: { Accept: 'text/html' } });
  if (!r.ok) throw new Error(`${r.status} for ${path}`);
  return r.text();
}

/* ----------------------------------------------------------------------- *
 * Meeting normalization
 * ----------------------------------------------------------------------- */
function bodyName(title){
  return (title || '')
    .replace(/&amp;/g, '&')
    .replace(/\s+(Regular|Special|Closed Session|Closed|Reorganization|Annual)\b.*$/i, '')
    .replace(/\s+Meeting.*$/i, '')
    .trim();
}
function videoIdFrom(url){
  if (!url) return null;
  const m = url.match(/[?&]v=([\w-]{11})/) || url.match(/youtu\.be\/([\w-]{11})/);
  return m ? m[1] : null;
}
function normalizeMeeting(m){
  const htmlAgenda = (m.documentList || []).find(d => d.templateName === 'HTML Agenda');
  return {
    id: m.id,
    rawTitle: (m.title || '').replace(/&amp;/g, '&'),
    body: bodyName(m.title),
    date: (m.dateTime || '').slice(0, 10),
    startTime: (m.dateTime || '').slice(11, 16),          // "17:30"
    templateId: htmlAgenda ? htmlAgenda.templateId : null,
    videoId: videoIdFrom(m.videoUrl),
  };
}

/* ----------------------------------------------------------------------- *
 * Time-estimate parsing
 * ----------------------------------------------------------------------- */
function normClock(t, ap){
  let [h, mn] = t.split(':'); if (mn === undefined) mn = '00';
  return `${parseInt(h,10)}:${mn.padStart(2,'0')} ${ap.toUpperCase()}`;
}
function clockToMin(clock){
  const m = (clock||'').match(/(\d+):(\d+)\s*(AM|PM)/i); if (!m) return null;
  let h = parseInt(m[1],10) % 12 + (/PM/i.test(m[3]) ? 12 : 0);
  return h * 60 + parseInt(m[2],10);
}

/* Parse a meeting's agenda HTML into items with schedule estimates. */
function parseAgenda(html){
  const $ = load(html);
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();

  // explicit per-item times anywhere in the agenda, e.g. "Item 16: 8:20 - 9:20 PM"
  const explicit = {};
  const allText = $('body').text();
  let m, reItem = /Item\s+(\d+):\s*([\d:]+)\s*[-–]\s*[\d:]+\s*(AM|PM)/gi;
  while ((m = reItem.exec(allText))) explicit[m[1]] = normClock(m[2], m[3]);

  // walk section-rows and meeting-items in document order to inherit section times
  const items = [];
  const seen = new Set();
  let sectionTime = null;
  $('.section-row, .meeting-item').each((_, el) => {
    const $el = $(el);
    if ($el.hasClass('section-row')) {
      const sm = clean($el.text()).match(/\(([\d:]+)\s*[-–]\s*[\d:]+\s*(AM|PM)\)/);
      if (sm) sectionTime = normClock(sm[1], sm[2]);
      return;
    }
    const num = clean($el.find('.number-cell').first().text()).replace(/\.$/, '');
    const title = clean($el.find('.agenda-item').first().text());
    if (!num || !title || seen.has(num)) return;
    seen.add(num);
    items.push({ num, title, schedTime: explicit[num] || sectionTime || null });
  });

  // meeting start = earliest section time we saw (fallback handled by caller)
  const firstSection = (() => {
    const sm = allText.match(/\(([\d:]+)\s*[-–]\s*[\d:]+\s*(AM|PM)\)/);
    return sm ? normClock(sm[1], sm[2]) : null;
  })();
  return { items, firstSection };
}

/* ----------------------------------------------------------------------- *
 * Main
 * ----------------------------------------------------------------------- */
async function main(){
  console.log(`Window: ${lo.toISOString().slice(0,10)} → ${hi.toISOString().slice(0,10)}`);

  // 1. enumerate meetings (archived years + upcoming)
  const archived = (await Promise.all(
    yearsNeeded.map(y => getJSON(`/api/v2/PublicPortal/ListArchivedMeetings?year=${y}`).catch(() => []))
  )).flat();
  const upcoming = await getJSON('/api/v2/PublicPortal/ListUpcomingMeetings').catch(() => []);

  const byId = new Map();
  for (const raw of [...archived, ...upcoming]) {
    const n = normalizeMeeting(raw);
    if (n.date && inWindow(n.date) && !byId.has(n.id)) byId.set(n.id, n);
  }
  const meetings = [...byId.values()].sort((a, b) => a.date.localeCompare(b.date));
  console.log(`Found ${meetings.length} meetings across ${new Set(meetings.map(m=>m.body)).size} bodies.`);

  // 2. fetch + parse agenda items for each meeting that has an agenda
  const out = [];
  for (const mt of meetings) {
    let items = [];
    if (mt.templateId) {
      try {
        const html = await getHTML(`/Portal/Meeting?meetingTemplateId=${mt.templateId}`);
        const parsed = parseAgenda(html);
        const startClock = startClockFrom(mt.startTime) || parsed.firstSection;
        const startMin = clockToMin(startClock);
        items = parsed.items.map(it => {
          const mins = clockToMin(it.schedTime);
          const elapsedSec = (mins != null && startMin != null && mins >= startMin)
            ? (mins - startMin) * 60 : null;
          return {
            num: it.num,
            title: it.title,
            topics: topicsFor(it.title),
            schedTime: it.schedTime,     // city's estimate, e.g. "8:20 PM"
            elapsedSec,                  // approx seconds into the meeting (for video jump)
          };
        });
        process.stdout.write(`  ${mt.date} ${mt.body}: ${items.length} items\n`);
        await sleep(FETCH_DELAY_MS);
      } catch (e) {
        console.warn(`  ! agenda fetch failed for ${mt.body} ${mt.date}: ${e.message}`);
      }
    }
    out.push({
      id: mt.id,
      body: mt.body,
      bodySlug: slug(mt.body),
      bodyEmail: bodyEmail(mt.body),
      title: mt.rawTitle,
      date: mt.date,
      startTime: mt.startTime,
      videoId: mt.videoId,                                       // null until the recording is posted
      agendaUrl: mt.templateId ? `${BASE}/Portal/Meeting?meetingTemplateId=${mt.templateId}` : null,
      items,
    });
  }

  const bodies = [...new Set(out.map(m => m.body))].sort().map(name => ({
    name, slug: slug(name), email: bodyEmail(name),
  }));

  console.log('Fetching local news…');
  const news = await fetchNews();
  console.log(`  ${news.length} local news items.`);

  console.log('Fetching community events…');
  const events = await fetchEvents();
  console.log(`  ${events.length} community events (next ${EVENTS_DAYS_AHEAD} days).`);

  const payload = {
    generatedAt: new Date().toISOString(),
    source: 'City of Palo Alto PrimeGov portal',
    portalBase: BASE,
    window: { from: lo.toISOString().slice(0,10), to: hi.toISOString().slice(0,10) },
    bodies,
    meetings: out,
    news,
    events,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, 'civic-data.json'), JSON.stringify(payload, null, 2));
  writeFileSync(join(OUT_DIR, 'civic-data.js'), 'window.CIVIC_DATA = ' + JSON.stringify(payload) + ';');
  console.log(`\nWrote civic-data.json and civic-data.js — ${out.length} meetings, ${out.reduce((s,m)=>s+m.items.length,0)} agenda items.`);
}

// "17:30" -> "5:30 PM"
function startClockFrom(hhmm){
  const m = (hhmm||'').match(/^(\d{2}):(\d{2})$/); if (!m) return null;
  let h = parseInt(m[1],10); const ap = h >= 12 ? 'PM' : 'AM'; let h12 = h % 12; if (h12===0) h12 = 12;
  return `${h12}:${m[2]} ${ap}`;
}

main().catch(e => { console.error(e); process.exit(1); });
