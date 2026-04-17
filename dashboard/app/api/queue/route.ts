/**
 * GET /api/queue - List all items in content queue
 * POST /api/queue - Add item to queue
 * PATCH /api/queue - Update queue item status
 */
import { NextResponse } from 'next/server'

// In-memory queue for demo (use Vercel Postgres in production)
let queue = [
  {
    id: 'q-001',
    signalId: 'sig-003',
    subject: 'Beyoncé',
    viralityScore: 95,
    status: 'approved',
    priority: 'critical',
    createdAt: new Date().toISOString(),
    article: {
      headline: 'BREAKING: Beyoncé Files Legal Documents — What We Know',
      deck: 'Court filings reveal...',
      body: {
        who: 'Beyoncé Knowles-Carter',
        what: 'Legal filing detected in LA Superior Court',
        when: 'April 17, 2026',
        where: 'Los Angeles Superior Court',
        why: 'Asset division related documents filed',
        keyFacts: [
          'Filing type: Unknown at this time',
          'Court: LA Superior Court',
          'Case status: Active'
        ]
      }
    },
    viralAssets: {
      tiktok: {
        hook: 'You won\'t believe what just happened with Beyoncé...',
        fact1: 'Court documents were filed today in LA',
        fact2: 'The filing appears to involve asset division',
        fact3: 'Beyoncé\'s team has not yet commented',
        closingLoop: 'Follow for updates as this story develops'
      },
      xThread: {
        posts: [
          { num: 1, text: '🚨 BREAKING: Court documents just dropped involving Beyoncé. This is not a drill.', isHook: true },
          { num: 2, text: 'LA Superior Court filings from today reveal...', isFact: true },
          { num: 3, text: 'The documents appear to be related to...', isFact: true },
          { num: 4, text: 'Beyoncé\'s legal team has not responded to requests for comment.', isFact: true },
          { num: 5, text: 'This is still developing. More to come.', isReveal: true },
          { num: 6, text: 'Follow for the latest updates on this developing story 🏆', isClosing: true }
        ]
      }
    }
  }
]

export async function GET() {
  return NextResponse.json({
    queue,
    stats: {
      total: queue.length,
      pending: queue.filter(i => i.status === 'pending').length,
      approved: queue.filter(i => i.status === 'approved').length,
      published: queue.filter(i => i.status === 'published').length
    }
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const item = {
      id: `q-${Date.now()}`,
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    queue.unshift(item)

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to queue' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    const item = queue.find(i => i.id === id)
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    item.status = status

    return NextResponse.json({ item })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update queue' }, { status: 500 })
  }
}
