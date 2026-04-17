/**
 * POST /api/viral
 * Generate viral assets (TikTok script + X thread) from article
 */
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { article } = await request.json()

    // Generate TikTok script
    const tiktokScript = {
      hook: `${article.headline.split(':')[1]?.trim() || article.subject} — you need to hear this.`,
      fact1: article.body?.keyFacts?.[0] || 'Major developments unfolding',
      fact2: article.body?.keyFacts?.[1] || 'Sources confirm the details',
      fact3: article.body?.keyFacts?.[2] || 'This is still developing',
      closingLoop: 'Follow for the FULL story. You won\'t want to miss this.',
      timing: {
        hookDuration: '0-3s',
        fact1Duration: '3-15s',
        fact2Duration: '15-27s',
        fact3Duration: '27-39s',
        closingDuration: '39-45s'
      }
    }

    // Generate X thread
    const xThread = [
      { num: 1, text: `🚨 BREAKING: ${article.headline}`, isHook: true },
      { num: 2, text: `Here's what we know so far:`, isFact: false },
      { num: 3, text: `• ${article.body?.keyFacts?.[0] || 'Developing details'}`, isFact: true },
      { num: 4, text: `• ${article.body?.keyFacts?.[1] || 'More details emerging'}`, isFact: true },
      { num: 5, text: `• ${article.body?.keyFacts?.[2] || 'Story is still developing'}`, isFact: true },
      { num: 6, text: `This is a developing story. Stay tuned for updates. #CelebrityNews`, isClosing: true }
    ]

    return NextResponse.json({
      tiktok: tiktokScript,
      xThread,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate viral assets' }, { status: 500 })
  }
}
