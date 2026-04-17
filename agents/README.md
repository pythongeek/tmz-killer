# TMZ-Killer Agent Suite

## Overview

The TMZ-Killer suite is a decentralized newsroom built for **velocity, verification, and viral distribution**. Six specialized agents work in concert to outpace traditional celebrity news outlets.

## Agent Architecture

| Module                               | Persona              | Role                              |
| ------------------------------------ | -------------------- | --------------------------------- |
| `osint-signal-agent.js`              | The Digital Paparazzi | Social/Flight Data Scraper        |
| `docket-hound-agent.js`              | The Receipt Gatherer  | Legal/Court Document Parser       |
| `viral-asset-factory.js`             | The Amplifier         | Video/Thread Generator            |
| `eic-orchestrator.js`                | "The Harvey"          | Triage & Logic Controller         |
| `seo-content-intelligence-agent.js`  | Content Strategist    | SEO Article Generator             |
| `wordpress-manager.js`               | Distribution Lead    | WordPress CMS Publisher           |

## Directory Structure

```
/agents/                  # All agent modules
/config/                  # Configuration (wordpress.json.example)
/data/                    # whale-database.json, etc.
/input/                   # incoming breaking-tip.json files
/output/
  /dockets/              # Court filing reports
  /pdfs/                 # Downloaded legal documents
  /seo-content/          # Generated SEO articles
  /viral-assets/         # Generated TikTok/thread content
  /published/            # Published post log
  /staging/              # Pre-publication staging
  /archive/              # Low-priority archived tips
```

## Quick Start

### 1. Start OSINT Monitoring
```bash
node agents/osint-signal-agent.js --mode=continuous-scan
```

### 2. Start Court Monitoring
```bash
node agents/docket-hound-agent.js --monitor
```

### 3. Watch for Tips & Triage
```bash
node agents/eic-orchestrator.js --watch
```

### 4. Generate SEO Content (manual)
```bash
node agents/seo-content-intelligence-agent.js "Celebrity Topic" --style=breaking --priority=urgent
```

### 5. Generate Viral Assets (manual)
```bash
node agents/viral-asset-factory.js --source input/story.json --outputs tiktok,x_thread
```

### 6. Push to WordPress
```bash
node agents/wordpress-manager.js --content output/seo-content/xxx.json --publish
```

## Pipeline Flow

```
Signal Detection (OSINT)
       ↓
Breaking Tip Generated (breaking-tip.json)
       ↓
EIC Triage (Virality Score)
       ↓
  >85: Full-throttle deployment
  50-84: SEO queue + gap analysis
       ↓
Legal Gate Scan
       ↓
SEO Content Creation (seo-content-intelligence-agent)
       ↓
Viral Asset Factory (TikTok + X Thread)
       ↓
WordPress Push (wordpress-manager)
```

## Virality Scoring (EIC)

Score > 85: **CRITICAL** — Full-throttle, bypasses review
Score 50-84: **STANDARD** — SEO queue, gap analysis focus
Score < 50: **LOW** — Archived

## Legal Gate

All content passes through a defamation/libel scan before WordPress push. Risks are flagged but don't necessarily block publication for critical stories.

## Configuration

Copy `config/wordpress.json.example` to `config/wordpress.json` and fill in your WordPress site credentials.

## Free Alternatives (No Paid APIs)

All agents have been updated to use **free alternatives** wherever possible.

See [`docs/FREE-ALTERNATIVES.md`](docs/FREE-ALTERNATIVES.md) for the complete guide.

### Summary

| Agent | Paid APIs Needed | Free Alternative |
|-------|-----------------|-----------------|
| osint-signal-agent.js | Instagram, Twitter, TikTok APIs | **OpenSky Network** (flight) + **Reddit** + **Google Trends** |
| docket-hound-agent.js | Court APIs | **Free court websites** + **Tesseract OCR** |
| viral-asset-factory.js | ElevenLabs, OpenAI TTS | **espeak-ng** + **FFmpeg** |
| seo-content-intelligence-agent.js | None | Pure logic (no external calls) |
| eic-orchestrator.js | None | Orchestrator only |
| wordpress-manager.js | None | Your own WordPress + app password |

### Quick Install (Ubuntu/Debian)
```bash
apt install poppler-utils tesseract-ocr espeak-ng ffmpeg imagemagick
```

## Status

All agents are 🟡 WIP — ready for production use with free alternatives. Only WordPress hosting (~$5/mo VPS) costs money if you don't already have it.
