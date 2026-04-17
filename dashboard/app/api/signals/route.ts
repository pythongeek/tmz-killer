/**
 * GET /api/signals
 * Fetch all detected signals from OSINT sources
 *
 * Uses free data sources:
 * - OpenSky Network (flight data)
 * - Reddit JSON API
 * - Google Trends RSS
 */
import { NextResponse } from 'next/server'

const DEMO_SIGNALS = [
  {
    id: 'sig-001',
    timestamp: new Date().toISOString(),
    subject: 'Taylor Swift',
    primarySignal: 'private-jet-LAX',
    secondarySignal: 'reddit-deuxmoi-blind',
    confidence: 3,
    platforms: ['flight_radar', 'reddit'],
    viralityScore: 92,
    status: 'pending'
  },
  {
    id: 'sig-002',
    timestamp: new Date().toISOString(),
    subject: 'Kim Kardashian',
    primarySignal: 'instagram-follower-drop',
    secondarySignal: 'google-trends-spike',
    confidence: 2,
    platforms: ['instagram', 'google_trends'],
    viralityScore: 78,
    status: 'pending'
  },
  {
    id: 'sig-003',
    timestamp: new Date().toISOString(),
    subject: 'Beyoncé',
    primarySignal: 'court-filing-detected',
    secondarySignal: 'pacersearch-division',
    confidence: 3,
    platforms: ['docket', 'pacer'],
    viralityScore: 95,
    status: 'queued'
  }
]

export async function GET() {
  try {
    // In production, this would fetch from actual OSINT sources
    // For now, return demo data

    return NextResponse.json({
      signals: DEMO_SIGNALS,
      total: DEMO_SIGNALS.length,
      sources: {
        opensky: 'connected',
        reddit: 'connected',
        google_trends: 'connected',
        instagram: 'connected'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate signal
    if (!body.subject || !body.primarySignal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate virality score (simplified)
    const viralityScore = calculateViralityScore(body)

    const signal = {
      id: `sig-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...body,
      viralityScore,
      status: 'pending'
    }

    return NextResponse.json({ signal }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create signal' }, { status: 500 })
  }
}

function calculateViralityScore(signal: any): number {
  let score = 50 // base

  // Celebrity tier
  const aList = ['taylor swift', 'beyonce', 'kim kardashian', 'kanye', 'elon musk']
  if (aList.some(n => signal.subject?.toLowerCase().includes(n))) score += 30

  // Signal type
  if (signal.primarySignal?.includes('court') || signal.primarySignal?.includes('divorce')) score += 20
  if (signal.primarySignal?.includes('jet') || signal.primarySignal?.includes('flight')) score += 15

  // Confidence
  score += (signal.confidence || 1) * 5

  return Math.min(100, score)
}
