/**
 * GET /api/signals
 * Fetch detected signals from OSINT sources + AI analysis in real-time
 *
 * Real free data sources (no API keys):
 * - Google Trends RSS
 * - Reddit JSON API
 * - OpenSky Network API
 *
 * Optional: MiniMax AI (set MINIMAX_API_KEY env var)
 */
import { NextResponse } from 'next/server'

// Celebrity watchlist - names to track
const CELEBRITY_WATCHLIST = [
  'taylor swift', 'beyonce', 'kim kardashian', 'kanye', 'kanye west',
  'elon musk', 'drake', 'ariana grande', 'selena gomez', 'justin',
  'bieber', 'jenifer lopez', 'a-rod', 'meghan markle', 'prince harry',
  'riana', 'tom brady', 'gisele', 'angelina', 'brad pitt',
  'jennifer aniston', 'jenna', 'ortega', 'beyonce', 'jay-z'
]

// MiniMax client
let miniMax: any = null
try {
  const mod = await import('@/lib/minimax')
  miniMax = mod
} catch {
  // MiniMax not configured
}

export const dynamic = 'force-dynamic' // Always fetch fresh data

export async function GET() {
  try {
    const [trends, reddit, opensky] = await Promise.allSettled([
      fetchGoogleTrends(),
      fetchRedditSignals(),
      fetchFlightSignals()
    ])

    const signals: any[] = []

    // Add Google Trends signals
    if (trends.status === 'fulfilled') {
      for (const t of trends.value) {
        signals.push(t)
      }
    }

    // Add Reddit signals
    if (reddit.status === 'fulfilled') {
      for (const r of reddit.value) {
        signals.push(r)
      }
    }

    // Add OpenSky flight signals
    if (opensky.status === 'fulfilled') {
      for (const f of opensky.value) {
        signals.push(f)
      }
    }

    // If no real signals, use demo
    if (signals.length === 0) {
      signals.push(...getDemoSignals())
    }

    // AI analysis if MiniMax available
    if (miniMax && process.env.MINIMAX_API_KEY) {
      for (const signal of signals) {
        try {
          const analysis = await miniMax.analyzeSignal(
            signal.subject,
            signal.primarySignal,
            signal.secondarySignal || ''
          )
          signal.viralityScore = analysis.viralityScore || signal.viralityScore
          signal.confidence = analysis.confidence || signal.confidence
          signal.aiSummary = analysis.summary
          signal.keyFacts = analysis.keyFacts
        } catch {}
      }
    }

    return NextResponse.json({
      signals,
      total: signals.length,
      fetchedAt: new Date().toISOString(),
      sources: {
        google_trends: trends.status === 'fulfilled' ? 'connected' : 'error',
        reddit: reddit.status === 'fulfilled' ? 'connected' : 'error',
        opensky: opensky.status === 'fulfilled' ? 'connected' : 'error',
        minimax: process.env.MINIMAX_API_KEY ? 'connected' : 'demo_mode'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.subject || !body.primarySignal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let viralityScore = calculateViralityScore(body)
    let aiSummary = ''
    let keyFacts: string[] = []

    if (miniMax && process.env.MINIMAX_API_KEY) {
      try {
        const analysis = await miniMax.analyzeSignal(
          body.subject, body.primarySignal, body.secondarySignal || ''
        )
        viralityScore = analysis.viralityScore || viralityScore
        aiSummary = analysis.summary || ''
        keyFacts = analysis.keyFacts || []
      } catch {}
    }

    const signal = {
      id: `sig-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...body,
      viralityScore,
      aiSummary,
      keyFacts,
      status: 'pending'
    }

    return NextResponse.json({ signal }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create signal' }, { status: 500 })
  }
}

// ===== REAL DATA FETCHERS =====

async function fetchGoogleTrends(): Promise<any[]> {
  const signals: any[] = []
  const GEO = 'US' // Change to 'GLOBAL' for worldwide

  try {
    const response = await fetch(
      `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${GEO}`,
      {
        headers: { 'User-Agent': 'TMZ-Killer/1.0' },
        next: { revalidate: 300 } // Cache 5 min
      }
    )

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const xml = await response.text()
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || []

    for (const item of items.slice(0, 10)) {
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
      const title = titleMatch ? titleMatch[1] : ''

      // Check if any celebrity matches
      for (const celeb of CELEBRITY_WATCHLIST) {
        if (title.toLowerCase().includes(celeb)) {
          const trafficMatch = item.match(/<ht:approxTraffic>(.*?)<\/ht:approxTraffic>/)
          signals.push({
            id: `trend-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            timestamp: new Date().toISOString(),
            subject: title,
            primarySignal: 'google-trends-spike',
            secondarySignal: `geo: ${GEO}, traffic: ${trafficMatch?.[1] || 'unknown'}`,
            confidence: 2,
            platforms: ['google_trends'],
            viralityScore: calculateFromTraffic(trafficMatch?.[1] || '0'),
            traffic: trafficMatch?.[1] || 'unknown',
            sourceUrl: `https://trends.google.com/trends/trendingsearches/daily?geo=${GEO}`,
            status: 'pending'
          })
          break
        }
      }
    }
  } catch (err) {
    console.error('Google Trends fetch failed:', err)
  }

  return signals
}

async function fetchRedditSignals(): Promise<any[]> {
  const signals: any[] = []
  const SUBREDDITS = ['FauxMoI', 'Dear_Molotov', 'CringeParam', 'DeuxMoi', 'CelebrityTruth']

  try {
    for (const sub of SUBREDDITS.slice(0, 2)) {
      const response = await fetch(
        `https://www.reddit.com/r/${sub}/new.json?limit=25`,
        {
          headers: { 'User-Agent': 'TMZ-Killer/1.0' },
          next: { revalidate: 120 }
        }
      )

      if (!response.ok) continue

      const data = await response.json()
      const posts = data.data?.children || []

      for (const post of posts.slice(0, 10)) {
        const title = post.data?.title || ''
        const score = post.data?.score || 0
        const url = post.data?.url || ''

        for (const celeb of CELEBRITY_WATCHLIST) {
          if (title.toLowerCase().includes(celeb)) {
            signals.push({
              id: `reddit-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              timestamp: new Date().toISOString(),
              subject: title,
              primarySignal: `reddit-${sub.toLowerCase()}`,
              secondarySignal: `score: ${score}`,
              confidence: score > 100 ? 3 : score > 50 ? 2 : 1,
              platforms: ['reddit'],
              viralityScore: Math.min(100, 50 + Math.floor(score / 20)),
              redditScore: score,
              redditUrl: url,
              subreddit: sub,
              sourceUrl: `https://reddit.com/r/${sub}/comments`,
              status: 'pending'
            })
            break
          }
        }
      }
    }
  } catch (err) {
    console.error('Reddit fetch failed:', err)
  }

  return signals
}

async function fetchFlightSignals(): Promise<any[]> {
  const signals: any[] = []

  try {
    // Get current epoch timestamps
    const now = Math.floor(Date.now() / 1000)
    const dayAgo = now - 86400

    // Flight bounding boxes for celebrity hotspots
    const HOTSPOTS = [
      { name: 'Los Angeles', bbox: '33.5,-118.7,34.3,-117.5' },
      { name: 'Miami', bbox: '25.5,-80.5,26.5,-79.5' },
      { name: 'NYC', bbox: '40.4,-74.3,41.0,-73.5' },
      { name: 'Las Vegas', bbox: '35.5,-115.5,36.5,-114.5' }
    ]

    for (const hotspot of HOTSPOTS.slice(0, 2)) {
      const [s, w, n, e] = hotspot.bbox.split(',').map(Number)
      const url = `https://opensky-network.org/api/flights/all?begin=${dayAgo}&end=${now}&bbox=${s},${w},${n},${e}`

      const response = await fetch(url, { next: { revalidate: 180 } })

      if (!response.ok) continue

      const flights = await response.json()

      for (const flight of flights.slice(0, 50)) {
        const callsign = (flight.callsign || '').trim()
        const icao24 = flight.icao24 || ''

        // Check if it's a private jet (short callsign, specific patterns)
        if (isPrivateJet(flight)) {
          signals.push({
            id: `flight-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            timestamp: new Date().toISOString(),
            subject: `Private Jet - ${hotspot.name}`,
            primarySignal: `private-jet-${hotspot.name.toLowerCase().replace(' ', '-')}`,
            secondarySignal: `callsign: ${callsign || 'unknown'}, from: ${flight.estDepartureAirport || '?'} → ${flight.estArrivalAirport || '?'}`,
            confidence: 2,
            platforms: ['flight_radar'],
            viralityScore: 65,
            callsign,
            icao24,
            origin: flight.estDepartureAirport,
            destination: flight.estArrivalAirport,
            sourceUrl: 'https://opensky-network.org',
            status: 'pending'
          })
        }
      }
    }
  } catch (err) {
    console.error('OpenSky fetch failed:', err)
  }

  return signals
}

// ===== HELPERS =====

function isPrivateJet(flight: any): boolean {
  const callsign = (flight.callsign || '').toUpperCase()
  // N-numbers (US private): N followed by 5 chars
  // European: similar patterns
  if (/^N[A-Z0-9]{5}$/.test(callsign)) return true
  if (/^[A-Z]{2}[A-Z0-9]{4}$/.test(callsign)) return true
  // No callsign but suspicious = possibly private
  if (!callsign && flight.number && flight.number < 1000) return true
  return false
}

function calculateFromTraffic(traffic: string): number {
  // Google Trends traffic format: "500K+", "200K+", etc.
  const num = parseInt(traffic?.replace(/[^0-9]/g, '') || '0')
  if (traffic?.includes('M+')) return 90
  if (traffic?.includes('500K+')) return 85
  if (traffic?.includes('200K+')) return 75
  if (traffic?.includes('100K+')) return 70
  if (num > 50000) return 65
  return 55
}

function calculateViralityScore(signal: any): number {
  let score = 50
  const aList = CELEBRITY_WATCHLIST.slice(0, 8)
  if (aList.some((n: string) => signal.subject?.toLowerCase().includes(n))) score += 30
  if (signal.primarySignal?.includes('court') || signal.primarySignal?.includes('divorce')) score += 20
  if (signal.primarySignal?.includes('jet') || signal.primarySignal?.includes('flight')) score += 15
  score += (signal.confidence || 1) * 5
  return Math.min(100, score)
}

function getDemoSignals() {
  return [
    {
      id: 'demo-001',
      timestamp: new Date().toISOString(),
      subject: 'Taylor Swift',
      primarySignal: 'google-trends-spike',
      secondarySignal: 'traffic: 500K+',
      confidence: 3,
      platforms: ['google_trends'],
      viralityScore: 92,
      status: 'pending'
    }
  ]
}
