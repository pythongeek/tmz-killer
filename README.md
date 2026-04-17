# TMZ-Killer

**Automated celebrity news pipeline** — detects breaking celebrity news before TMZ, generates SEO articles, TikTok scripts, and X threads, then publishes to WordPress automatically.

> Zero paid APIs required. Runs entirely on free data sources.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TMZ-Killer Pipeline                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐    │
│   │   OSINT      │───▶│     EIC      │───▶│      SEO         │    │
│   │   Signal     │    │  Orchestrator│    │    Content       │    │
│   │   Agent      │    │   (Triage)   │    │   Agent          │    │
│   └──────────────┘    └──────────────┘    └──────────────────┘    │
│         │                    │                      │               │
│         ▼                    ▼                      ▼               │
│   Free Sources:       Virality Score:        Gap Analysis:        │
│   - OpenSky Network   >85 = Critical      Long-tail SEO          │
│   - Reddit JSON       50-84 = Standard     Keywords               │
│   - Google Trends     <50 = Archive                             │
│   - Instagram scrape                                               │
│                              │                      │               │
│                              ▼                      ▼               │
│                     ┌──────────────┐    ┌──────────────────┐      │
│                     │    Legal    │    │   Viral Asset    │      │
│                     │    Gate     │    │    Factory       │      │
│                     └──────────────┘    └──────────────────┘      │
│                                                 │                  │
│                                                 ▼                  │
│                                      TikTok Script (45s)          │
│                                      X Thread (5-7 posts)         │
│                                                 │                  │
│                                                 ▼                  │
│                                      ┌──────────────────┐         │
│                                      │    WordPress    │         │
│                                      │    Manager      │         │
│                                      └──────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

## Features

- **🚀 Speed** — Detects signals in real-time, publishes within minutes
- **✅ Verified** — Multi-platform confirmation required before publishing
- **📊 Virality Scoring** — Prioritizes high-impact celebrity stories
- **⚖️ Legal Gate** — Defamation/libel scan before any publish
- **📱 Multi-Platform** — Generates content for WordPress, TikTok, and X
- **💰 Free** — No paid API subscriptions needed

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/tmz-killer.git
cd tmz-killer
```

### 2. Install Node.js dependencies

```bash
# For agents
npm install

# For dashboard
cd dashboard && npm install && cd ..
```

### 3. Install free system tools (Ubuntu/Debian)

```bash
apt install poppler-utils tesseract-ocr espeak-ng ffmpeg imagemagick
```

### 4. Configure WordPress

```bash
cp config/wordpress.json.example config/wordpress.json
# Edit with your WordPress credentials
```

### 5. Run the pipeline

```bash
# Start OSINT monitoring (terminal 1)
node agents/osint-signal-agent.js --mode=continuous-scan

# Start EIC watch (terminal 2)
node agents/eic-orchestrator.js --watch
```

Or use the **web dashboard**:

```bash
cd dashboard
vercel dev   # or: npm run dev
```

## Dashboard

The web dashboard provides a visual interface for:

| Page | Description |
|------|-------------|
| `/signals` | Live feed of detected celebrity news signals |
| `/queue` | Approve/reject tips based on virality score |
| `/articles` | Edit SEO content before publishing |
| `/viral` | Preview TikTok scripts + X threads |
| `/settings` | Configure WordPress connection |

### Deploy Dashboard to Vercel (Free)

```bash
cd dashboard
vercel
```

Set environment variables in Vercel:
- `WORDPRESS_SITE_URL`
- `WORDPRESS_USERNAME`
- `WORDPRESS_APP_PASSWORD`

## Directory Structure

```
tmz-killer/
├── agents/                     # CLI agent scripts
│   ├── osint-signal-agent.js
│   ├── docket-hound-agent.js
│   ├── viral-asset-factory.js
│   ├── eic-orchestrator.js
│   ├── seo-content-intelligence-agent.js
│   └── wordpress-manager.js
├── dashboard/                  # Next.js web dashboard
│   ├── app/
│   │   ├── api/              # API routes
│   │   └── (dashboard)/      # Dashboard pages
│   ├── package.json
│   └── ...
├── config/                     # Configuration templates
├── data/                       # Whale database
├── docs/                       # Documentation
│   └── FREE-ALTERNATIVES.md
├── input/                      # Incoming tips
└── output/                     # Generated content
```

## Free Data Sources

| Source | What It Tracks | Cost |
|--------|---------------|------|
| OpenSky Network | Private jet flights | FREE |
| Reddit API | Celebrity gossip (r/DeuxMoi, r/FauxMoI) | FREE |
| Google Trends RSS | Trending celebrity searches | FREE |
| LA Superior Court | Legal filings | FREE |
| NY Courts | Legal filings | FREE |
| Miami-Dade Courts | Legal filings | FREE |
| PACER | Federal filings (search free) | FREE |
| Tesseract OCR | PDF text extraction | FREE |
| espeak-ng | Text-to-speech | FREE |
| FFmpeg | Video generation | FREE |

## Tech Stack

| Layer | Technology | Cost |
|-------|------------|------|
| Hosting | Vercel (dashboard) | FREE |
| Database | Vercel Postgres (optional) | FREE tier |
| CMS | Your WordPress | $5-10/mo |
| Agents | Node.js | FREE |
| TTS | espeak-ng / Google Translate | FREE |
| Video | FFmpeg | FREE |
| OCR | Tesseract | FREE |

## License

MIT
