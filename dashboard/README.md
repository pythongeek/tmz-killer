# TMZ-Killer Dashboard

Web-based dashboard to manage the TMZ-Killer newsroom pipeline.

## Deploy to Vercel (Free)

```bash
cd dashboard
npm install
vercel
```

## Features

- **Signal Feed** — Live view of detected celebrity news signals
- **Content Queue** — Approve/reject/skip incoming tips
- **Article Editor** — Preview + edit generated SEO content
- **Viral Assets** — Preview TikTok scripts + X threads
- **Publish** — One-click push to WordPress

## Setup

1. Create `.env.local` with:
```env
WORDPRESS_SITE_URL=https://your-wordpress.com
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

2. For local dev without Vercel Postgres:
   - Data is stored in-memory or local JSON files
   - The agents can run separately via CLI

## Tech Stack

- Next.js 14 (App Router)
- Vercel Postgres (free tier: 1GB)
- WordPress REST API
- Tailwind CSS
