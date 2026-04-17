/**
 * MiniMax LLM API Client
 * MiniMax MoE (Mixture of Experts) LLM for AI-powered analysis
 *
 * Docs: https://www.minimaxi.com/document
 */

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || ''
const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1'

interface MiniMaxMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface MiniMaxResponse {
  id: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * Send a chat completion request to MiniMax
 */
export async function miniMaxChat(
  messages: MiniMaxMessage[],
  model = 'abab6.5s-chat',
  temperature = 0.7
): Promise<string> {
  if (!MINIMAX_API_KEY) {
    throw new Error('MINIMAX_API_KEY environment variable not set')
  }

  const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`MiniMax API error: ${response.status} - ${error}`)
  }

  const data: MiniMaxResponse = await response.json()
  return data.choices[0]?.message?.content || ''
}

/**
 * Analyze a celebrity signal and determine if it's newsworthy
 */
export async function analyzeSignal(subject: string, signal: string, context: string): Promise<{
  isNewsworthy: boolean
  viralityScore: number
  confidence: number
  summary: string
  keyFacts: string[]
}> {
  const response = await miniMaxChat([
    {
      role: 'system',
      content: `You are a celebrity news editor. Analyze celebrity signals and determine if they are newsworthy.
Return JSON with this exact format:
{
  "isNewsworthy": true/false,
  "viralityScore": 0-100,
  "confidence": 0-3,
  "summary": "2 sentence summary",
  "keyFacts": ["fact1", "fact2", "fact3"]
}`
    },
    {
      role: 'user',
      content: `Subject: ${subject}\nSignal: ${signal}\nContext: ${context}\n\nAnalyze this celebrity news signal.`
    }
  ])

  try {
    return JSON.parse(response)
  } catch {
    return {
      isNewsworthy: false,
      viralityScore: 0,
      confidence: 0,
      summary: response,
      keyFacts: []
    }
  }
}

/**
 * Generate SEO article content from a signal
 */
export async function generateSEOArticle(signal: {
  subject: string
  primarySignal: string
  secondarySignal: string
}): Promise<{
  headline: string
  deck: string
  body: Record<string, string>
  seo: { metaTitle: string; metaDescription: string; keywords: string[] }
}> {
  const response = await miniMaxChat([
    {
      role: 'system',
      content: `You are a celebrity news SEO content writer. Generate a complete SEO article from a news signal.
Return JSON with this exact format:
{
  "headline": "Breaking news headline",
  "deck": "2 sentence deck/subheadline",
  "body": {
    "who": "Who is involved",
    "what": "What happened",
    "when": "When did it happen",
    "where": "Where did it happen",
    "why": "Why did it happen (if known)",
    "keyFacts": ["key fact 1", "key fact 2", "key fact 3"],
    "background": "Background context",
    "whatThisMeans": "What this means for readers"
  },
  "seo": {
    "metaTitle": "SEO meta title under 60 chars",
    "metaDescription": "SEO meta description under 160 chars",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
}`
    },
    {
      role: 'user',
      content: `Generate a celebrity news SEO article from this signal:\nSubject: ${signal.subject}\nPrimary Signal: ${signal.primarySignal}\nSecondary Signal: ${signal.secondarySignal}`
    }
  ])

  try {
    return JSON.parse(response)
  } catch {
    throw new Error(`Failed to parse SEO article response: ${response}`)
  }
}

/**
 * Generate viral TikTok script
 */
export async function generateTikTokScript(article: {
  headline: string
  keyFacts: string[]
}): Promise<{
  hook: string
  fact1: string
  fact2: string
  fact3: string
  closingLoop: string
}> {
  const response = await miniMaxChat([
    {
      role: 'system',
      content: `You are a viral TikTok content writer. Generate a 45-second TikTok script.
The script should have:
- Hook (0-3s): Attention-grabbing opener
- Fact 1 (3-15s): First key fact
- Fact 2 (15-27s): Second key fact
- Fact 3 (27-39s): Third key fact
- Closing (39-45s): Follow-for-more closer

Return JSON:
{
  "hook": "3 second hook",
  "fact1": "12 second fact",
  "fact2": "12 second fact",
  "fact3": "12 second fact",
  "closingLoop": "closing CTA"
}`
    },
    {
      role: 'user',
      content: `Headline: ${article.headline}\nKey Facts: ${article.keyFacts.join(', ')}`
    }
  ])

  try {
    return JSON.parse(response)
  } catch {
    throw new Error(`Failed to parse TikTok script: ${response}`)
  }
}

/**
 * Generate X (Twitter) thread
 */
export async function generateXThread(article: {
  headline: string
  keyFacts: string[]
  summary: string
}): Promise<Array<{ num: number; text: string; isHook?: boolean; isClosing?: boolean }>> {
  const response = await miniMaxChat([
    {
      role: 'system',
      content: `You are a viral X (Twitter) thread writer. Generate a 5-7 post thread.
Rules:
- Post 1: HOOK (stop the scroll, create curiosity)
- Posts 2-4: FACTS (build the story)
- Post 5: REVEAL/PLOT TWIST
- Post 6-7: CLOSING + CTA (follow for more)

Return JSON array:
[
  {"num": 1, "text": "hook text", "isHook": true},
  {"num": 2, "text": "fact 1"},
  {"num": 3, "text": "fact 2"},
  {"num": 4, "text": "fact 3"},
  {"num": 5, "text": "reveal/twist"},
  {"num": 6, "text": "closing CTA", "isClosing": true}
]`
    },
    {
      role: 'user',
      content: `Headline: ${article.headline}\nKey Facts: ${article.keyFacts.join(', ')}\nSummary: ${article.summary}`
    }
  ])

  try {
    return JSON.parse(response)
  } catch {
    throw new Error(`Failed to parse X thread: ${response}`)
  }
}

/**
 * Translate legal jargon to plain English
 */
export async function translateLegalToEnglish(legalText: string): Promise<{
  plainEnglish: string
  dramaBulletPoints: string[]
}> {
  const response = await miniMaxChat([
    {
      role: 'system',
      content: `You are a legal document translator for celebrity news. Convert legal jargon to plain English drama bullet points.
Rules:
- NEVER speculate, only translate what is explicitly stated
- Make it engaging and newsworthy
- Flag anything unclear as "[UNCONFIRMED]"

Return JSON:
{
  "plainEnglish": "Plain English summary paragraph",
  "dramaBulletPoints": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"]
}`
    },
    {
      role: 'user',
      content: `Translate this legal filing to plain English:\n\n${legalText}`
    }
  ])

  try {
    return JSON.parse(response)
  } catch {
    throw new Error(`Failed to parse legal translation: ${response}`)
  }
}
