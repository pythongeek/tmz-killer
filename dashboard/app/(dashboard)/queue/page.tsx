'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface QueueItem {
  id: string
  signalId: string
  subject: string
  viralityScore: number
  status: string
  priority: string
  createdAt: string
  article?: any
}

export default function QueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, published: 0 })
  const router = useRouter()

  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 10000)
    return () => clearInterval(interval)
  }, [])

  async function fetchQueue() {
    try {
      const res = await fetch('/api/queue')
      const data = await res.json()
      setQueue(data.queue || [])
      setStats(data.stats || {})
    } catch (error) {
      console.error('Failed to fetch queue:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/queue', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    fetchQueue()
  }

  async function generateArticle(item: QueueItem) {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signalId: item.signalId,
        subject: item.subject,
        signal: { primarySignal: item.signalId, viralityScore: item.viralityScore }
      })
    })
    const data = await res.json()
    // Update queue with article
    console.log('Generated article:', data.article)
    router.push(`/articles?item=${item.id}`)
  }

  function getPriorityColor(priority: string) {
    if (priority === 'critical') return 'bg-red-600 text-white'
    if (priority === 'standard') return 'bg-yellow-600 text-black'
    return 'bg-gray-600 text-white'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Queue</h1>
        <p className="text-gray-400 text-sm">Approve, edit, or reject incoming tips</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
          { label: 'Approved', value: stats.approved, color: 'text-blue-400' },
          { label: 'Published', value: stats.published, color: 'text-green-400' }
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading queue...</div>
        ) : queue.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No items in queue. Signals with score &gt;50 will appear here.
          </div>
        ) : (
          queue.map((item) => (
            <div key={item.id} className="bg-gray-900 rounded-lg p-5 border border-gray-800">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{item.subject}</h3>
                    {item.priority && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">
                    Signal: {item.signalId} • {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  item.viralityScore >= 85 ? 'bg-red-950 text-red-400' :
                  item.viralityScore >= 50 ? 'bg-yellow-950 text-yellow-400' :
                  'bg-gray-800 text-gray-400'
                }`}>
                  Score: {item.viralityScore}
                </span>
              </div>

              {item.article && (
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Headline Preview</p>
                  <p className="font-medium">{item.article.headline}</p>
                  <p className="text-sm text-gray-400 mt-1">{item.article.deck}</p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {item.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(item.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, 'rejected')}
                        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {item.status === 'approved' && !item.article && (
                    <button
                      onClick={() => generateArticle(item)}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition"
                    >
                      Generate Article
                    </button>
                  )}
                  {item.status === 'approved' && item.article && (
                    <button
                      onClick={() => router.push(`/articles?item=${item.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition"
                    >
                      Edit Article →
                    </button>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                  item.status === 'approved' ? 'bg-blue-900 text-blue-300' :
                  item.status === 'published' ? 'bg-green-900 text-green-300' :
                  'bg-gray-800 text-gray-400'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
