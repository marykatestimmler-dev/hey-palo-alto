# Civic Pulse — Agenda Ingest

Pulls **every** Palo Alto public body's meetings — City Council plus all
commissions and committees — for the **past 6 months through the next 6 months**,
directly from the city's official **PrimeGov** portal, and writes the data the
app reads.

## What it produces

Two files, one level up (next to `palo-alto-civic-pulse.html`):

- `civic-data.json` — canonical, normalized data
- `civic-data.js` — the same data as `window.CIVIC_DATA = {…}` so the local
  `file://` app can load it with a plain `<script>` tag (no server/CORS needed)

Shape:

```jsonc
{
  "generatedAt": "2026-…",
  "source": "City of Palo Alto PrimeGov portal",
  "window": { "from": "2025-12-08", "to": "2026-12-08" },
  "bodies":  [ { "name": "City Council", "slug": "city-council", "email": "city.council@PaloAlto.gov" }, … ],
  "meetings": [
    {
      "id": 2838,
      "body": "City Council",
      "bodySlug": "city-council",
      "bodyEmail": "city.council@PaloAlto.gov",
      "title": "City Council Regular Meeting",
      "date": "2026-06-01",
      "startTime": "17:30",
      "videoId": "Cczy-CGO8IE",         // null until the recording is posted
      "agendaUrl": "https://cityofpaloalto.primegov.com/Portal/Meeting?meetingTemplateId=18727",
      "items": [
        {
          "num": "16",
          "title": "Outdoor Activation Standards … Car-Free Portion of California Avenue …",
          "topics": ["Downtown & Business", "Transportation"],
          "schedTime": "8:20 PM",       // the city's own agenda estimate
          "elapsedSec": 10200           // ≈ seconds into the meeting, for the video jump-link
        }
      ]
    }
  ]
}
```

## Run it

```bash
cd ingest
npm install        # installs cheerio
node ingest.mjs    # writes ../civic-data.json and ../civic-data.js
```

Refresh whenever you want current data. To run it automatically (e.g. nightly),
wire `node ingest.mjs` into a cron job or a scheduled serverless function — see
`../ROADMAP-to-public-version.md`.

## How it works

1. **Enumerate meetings** — `ListArchivedMeetings?year=YYYY` (past) +
   `ListUpcomingMeetings` (future), filtered to the ±6-month window and deduped.
2. **Agenda items** — each meeting page (`/Portal/Meeting?meetingTemplateId=…`)
   is server-rendered HTML; items are parsed from the `.meeting-item` /
   `.number-cell` / `.agenda-item` structure, and time estimates from the
   `.section-row` headers.
3. **Video** — the meeting's YouTube recording id, when posted.

## Honest limitations

- **Time estimates are the city's own published estimates**, not transcript
  timestamps. Meetings run long or short, so `schedTime` / `elapsedSec` locate a
  discussion *approximately*. The app always pairs the jump-link with the
  official agenda so users can verify.
- **Selectors track PrimeGov's markup.** If the city changes platforms or markup,
  update the selectors in `parseAgenda()` and the endpoints at the top of
  `ingest.mjs` — these are deliberately isolated so a change is a one-file fix.
- **Be polite:** a 250 ms delay is inserted between agenda fetches.
