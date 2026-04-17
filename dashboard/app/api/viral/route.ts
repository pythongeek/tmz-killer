/**
 * POST /api/viral
 * Generate viral assets (TikTok script + X thread) using MiniMax AI
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
    const { article } = await request.json()

    let tiktok: any
    let xThread: any[]

    // Use MiniMax AI if available
    if (miniMax && process.env.MINIMAX_API_KEY) {
      try {
        ;[tiktok, xThread] = await Promise.all([
          miniMax.generateTikTokScript({
            headline: article.headline,
            keyFacts: article.body?.keyFacts || []
          }),
          miniMax.generateXThread({
            headline: article.headline,
            keyFacts: article.body?.keyFacts || [],
            summary: article.deck || article.body?.whatThisMeans || ''
          })
        ])
        tiktok.timing = {
          hookDuration: '0-3s',
          fact1Duration: '3-15s',
          fact2Duration: '15-27s',
          fact3Duration: '27-39s',
          closingDuration: '39-45s'
        }
      } catch (err) {
        console.error('MiniMax viral generation failed:', err)
        const fallback = generateFallback(article)
        tiktok = fallback.tiktok
        xThread = fallback.xThread
      }
    } else {
      const fallback = generateFallback(article)
      tiktok = fallback.tiktok
      xThread = fallback.xThread
    }

    return NextResponse.json({
      tiktok,
      xThread,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate viral assets' }, { status: 500 })
  }
}

function generateFallback(article: any) {
  const keyFacts = article.body?.keyFacts || []
  return {
    tiktok: {
      hook: `${article.headline.split(':')[1]?.trim() || article.subject} — you need to hear this.`,
      fact1: keyFacts[0] || 'Major developments unfolding',
      fact2: keyFacts[1] || 'Sources confirm the details',
      fact3: keyFacts[2] || 'This is still developing',
      closingLoop: 'Follow for the FULL story.',
      timing: {
        hookDuration: '0-3s',
        fact1Duration: '3-15s',
        fact2Duration: '15-27s',
        fact3Duration: '27-39s',
        closingDuration: '39-45s'
      }
    },
    xThread: [
      { num: 1, text: `🚨 BREAKING: ${article.headline}`, isHook: true },
      { num: 2, text: `Here's what we know so far:`, isFact: false },
      { num: 3, text: `• ${keyFacts[0] || 'Developing details'}`, isFact: true },
      { num: 4, text: `• ${keyFacts[1] || 'More details emerging'}`, isFact: true },
      { num: 5, text: `• ${keyFacts[2] || 'Story is still developing'}`, isFact: true },
      { num: 6, text: `This is a developing story. Stay tuned for updates. #CelebrityNews`, isClosing: true }
    ]
  }
}
