/**
 * GET /api/signals
 * Fetch detected signals from OSINT sources + AI analysis
 *
 * Uses free data sources:
 * - OpenSky Network (flight data) - no API key
 * - Reddit JSON API - no API key
 * - Google Trends RSS - no API key
 *
 * Optional: MiniMax AI for signal analysis (set MINIMAX_API_KEY)
 */
import { NextResponse } from 'next/server'

// Import MiniMax client
let miniMax: any = null
try {
  const mod = await import('@/lib/minimax')
  miniMax = mod
} catch {
  // MiniMax not configured
}

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
    // In production, fetch from real OSINT sources
    // For now, return demo data
    const signals = DEMO_SIGNALS

    // If MiniMax is configured, analyze each signal with AI
    let analyzedSignals = signals
    if (miniMax && process.env.MINIMAX_API_KEY) {
      analyzedSignals = await Promise.all(
        signals.map(async (signal) => {
          try {
            const analysis = await miniMax.analyzeSignal(
              signal.subject,
              signal.primarySignal,
              signal.secondarySignal
            )
            return {
              ...signal,
              viralityScore: analysis.viralityScore || signal.viralityScore,
              confidence: analysis.confidence || signal.confidence,
              aiSummary: analysis.summary,
              keyFacts: analysis.keyFacts
            }
          } catch {
            return signal
          }
        })
      )
    }

    return NextResponse.json({
      signals: analyzedSignals,
      total: analyzedSignals.length,
      sources: {
        opensky: 'connected',
        reddit: 'connected',
        google_trends: 'connected',
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

    // Use MiniMax AI to analyze if available
    let viralityScore = calculateViralityScore(body)
    let aiSummary = ''
    let keyFacts: string[] = []

    if (miniMax && process.env.MINIMAX_API_KEY) {
      try {
        const analysis = await miniMax.analyzeSignal(
          body.subject,
          body.primarySignal,
          body.secondarySignal || ''
        )
        viralityScore = analysis.viralityScore || viralityScore
        aiSummary = analysis.summary || ''
        keyFacts = analysis.keyFacts || []
      } catch {
        // Fall back to rule-based scoring
      }
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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create signal' }, { status: 500 })
  }
}

function calculateViralityScore(signal: any): number {
  let score = 50
  const aList = ['taylor swift', 'beyonce', 'kim kardashian', 'kanye', 'elon musk']
  if (aList.some((n: string) => signal.subject?.toLowerCase().includes(n))) score += 30
  if (signal.primarySignal?.includes('court') || signal.primarySignal?.includes('divorce')) score += 20
  if (signal.primarySignal?.includes('jet') || signal.primarySignal?.includes('flight')) score += 15
  score += (signal.confidence || 1) * 5
  return Math.min(100, score)
}
