# Free API Alternatives Guide

**No paid APIs required** — all tools below are 100% free or self-hosted.

---

## OSINT Signal Agent

| Feature | Paid Option | Free Alternative | Cost |
|---------|-------------|-----------------|------|
| Instagram monitoring | Instagram Graph API | instagram-private-api npm package | FREE |
| Twitter/X monitoring | Twitter API v2 ($100/mo) | Nitter (nitter.net) RSS feeds | FREE |
| TikTok monitoring | TikTok API | Google Trends RSS + Reddit | FREE |
| Flight tracking | FlightRadar24 API | **OpenSky Network** (no key needed) | FREE |

### OpenSky Network (Private Jets)
- **Website:** https://opensky-network.org
- **API:** https://opensky-network.org/apidoc
- **No API key required**
- **Limit:** 1000 requests/hour (more than enough)
- **Data:** Real ADS-B flight data, no cost

### Reddit as Celebrity Signal
- **Website:** https://www.reddit.com
- **API:** Public JSON endpoints (no auth for read-only)
- **Subreddits to monitor:**
  - `FauxMoI` - Celebrity gossip
  - `Dear_Molotov` - Relationship tea
  - `DeuxMoi` - Blind items
- **Cost:** FREE

### Google Trends RSS
- **URL:** https://trends.google.com/trends/trendingsearches/daily/rss?geo=US
- **Cost:** FREE
- **Use:** Real-time trending celebrity searches

---

## Docket Hound Agent

| Feature | Paid Option | Free Alternative | Cost |
|---------|-------------|-----------------|------|
| Court access | CourtListener API | Direct court websites (all free to search) | FREE |
| PACER | $0.10/page | **Searching is FREE** (only downloads cost) | FREE |
| OCR | AWS Textract, Google Vision | **Tesseract OCR** (self-hosted) | FREE |
| PDF text extraction | Adobe API | **pdftotext** (poppler-utils) | FREE |

### Court Websites (All Free to Search)
- **LA Superior:** https://portal.lascourtsonline.org (free account)
- **NY Courts:** https://iapps.courts.state.ny.us (free search)
- **Miami-Dade:** https://www.miami-courts.com (free search)
- **PACER:** https://pacer.login.uscourts.gov (free to search, pay per page)

### Tesseract OCR (Free)
```bash
# Install on Ubuntu/Debian
apt install tesseract-ocr tesseract-ocr-eng

# For PDFs, also need:
apt install poppler-utils ghostscript
```

### pdftotext (Free)
```bash
# Install on Ubuntu/Debian
apt install poppler-utils

# Use
pdftotext document.pdf -  # outputs to stdout
```

---

## Viral Asset Factory

| Feature | Paid Option | Free Alternative | Cost |
|---------|-------------|-----------------|------|
| Text-to-Speech | ElevenLabs, OpenAI TTS | **Google Translate TTS** or **espeak-ng** | FREE |
| Video editing | Adobe Premiere | **FFmpeg** | FREE |
| Captions | Rev.com, etc. | **FFmpeg drawtext** | FREE |
| Image generation | DALL-E, Midjourney | Stock footage + text overlays | FREE |

### espeak-ng (Offline TTS)
```bash
# Install
apt install espeak-ng

# Use
espeak-ng "Hello world" -w output.wav --rate=150
```

### FFmpeg (Video Generation)
```bash
# Install
apt install ffmpeg

# Example: Create video from image + audio
ffmpeg -loop 1 -i background.jpg -i voice.mp3 \
  -vf "scale=1080:1920" -t 45 \
  -c:v libx264 -pix_fmt yuv420p output.mp4
```

### Google Translate TTS (Quick & Free)
```bash
# No installation needed - uses Google's servers
curl "https://translate.google.com/translate_tts?ie=UTF-8&q=Hello&tl=en-US&client=twob" \
  -o output.mp3 -A "Mozilla/5.0"
```

### Coqui TTS (Best Quality, Self-Hosted)
```bash
# Install
pip install TTS

# Use (high quality, no rate limits)
tts --text "Your script here" --output_path output.wav
```

---

## WordPress Manager

| Feature | Paid Option | Free Alternative | Cost |
|---------|-------------|-----------------|------|
| CMS | Headless CMS services | **WordPress REST API** (your own site) | FREE |
| Hosting | WordPress.com | Self-hosted WordPress on any VPS | $5-10/mo |
| Authentication | Paid SSO | WordPress App Passwords | FREE |

### WordPress REST API Setup
1. Log into WordPress admin
2. Go to **Users → Profile**
3. Find **Application Passwords** section
4. Generate new password (name it "TMZ-Killer")
5. Use username + that password in `config/wordpress.json`

---

## Quick Install Script

Run this on Ubuntu/Debian to install all free tools:

```bash
#!/bin/bash
# Install all free tools needed for TMZ-Killer

# Court/documents
apt update
apt install -y poppler-utils ghostscript tesseract-ocr tesseract-ocr-eng

# TTS
apt install -y espeak-ng

# Video
apt install -y ffmpeg imagemagick

# Node.js tools (for npm packages)
# npm install instagram-private-api pdf-parse
```

---

## Summary: Zero API Keys Needed

If you use only free alternatives:

| Agent | API Keys Needed |
|-------|-----------------|
| osint-signal-agent.js | **NONE** (uses OpenSky, Reddit, Google Trends) |
| docket-hound-agent.js | **NONE** (uses free court sites + Tesseract) |
| viral-asset-factory.js | **NONE** (uses espeak-ng + FFmpeg) |
| seo-content-intelligence-agent.js | **NONE** (pure logic) |
| eic-orchestrator.js | **NONE** (orchestrator only) |
| wordpress-manager.js | **NONE** (uses your own WP with app password) |

**The only cost** is web hosting (~$5-10/mo for a VPS) if you don't already have WordPress hosting.
