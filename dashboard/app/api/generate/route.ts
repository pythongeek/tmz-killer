/**
 * POST /api/generate
 * Generate SEO article from signal using MiniMax AI
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

export async function POST(request: Request) {
  try {
    const { signalId, subject, signal } = await request.json()

    let article: any

    // Use MiniMax AI if available
    if (miniMax && process.env.MINIMAX_API_KEY) {
      try {
        article = await miniMax.generateSEOArticle({
          subject,
          primarySignal: signal?.primarySignal || '',
          secondarySignal: signal?.secondarySignal || ''
        })
        article.signalId = signalId
        article.generatedAt = new Date().toISOString()
        article.status = 'draft'
        article.aiGenerated = true
      } catch (err: any) {
        console.error('MiniMax generation failed:', err)
        // Fall back to template
        article = generateFallbackArticle(signalId, subject, signal)
      }
    } else {
      // Fall back to template article
      article = generateFallbackArticle(signalId, subject, signal)
    }

    return NextResponse.json({ article })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate article' }, { status: 500 })
  }
}

function generateFallbackArticle(signalId: string, subject: string, signal: any) {
  return {
    signalId,
    headline: `BREAKING: ${subject} — What We Know So Far`,
    deck: `New developments have emerged regarding ${subject}. Here's everything we know.`,
    body: {
      who: subject,
      what: signal?.primarySignal || 'Developing story',
      when: new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }),
      where: 'Developing',
      why: 'Story is developing',
      keyFacts: [
        `${subject} is at the center of a new development`,
        `Signal detected from: ${signal?.platforms?.join(', ') || 'OSINT sources'}`,
        `Virality score: ${signal?.viralityScore || 'Calculating...'}`
      ],
      background: 'Multiple sources indicate this is a significant development.',
      whatThisMeans: 'This story is still developing. Follow for updates.'
    },
    seo: {
      metaTitle: `${subject} News: Latest Updates | TMZ-Killer`,
      metaDescription: `Get the latest ${subject} news, rumors, and updates.`,
      keywords: [subject.toLowerCase(), 'celebrity', 'news', 'update', 'breaking']
    },
    generatedAt: new Date().toISOString(),
    status: 'draft',
    aiGenerated: false
  }
}
