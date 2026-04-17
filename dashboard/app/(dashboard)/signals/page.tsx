'use client'

import { useEffect, useState } from 'react'

interface Signal {
  id: string
  timestamp: string
  subject: string
  primarySignal: string
  secondarySignal: string
  confidence: number
  platforms: string[]
  viralityScore: number
  status: string
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [sources, setSources] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchSignals()
    const interval = setInterval(fetchSignals, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  async function fetchSignals() {
    try {
      const res = await fetch('/api/signals')
      const data = await res.json()
      setSignals(data.signals || [])
      setSources(data.sources || {})
    } catch (error) {
      console.error('Failed to fetch signals:', error)
    } finally {
      setLoading(false)
    }
  }

  function getScoreColor(score: number) {
    if (score >= 85) return 'text-red-400 bg-red-950'
    if (score >= 50) return 'text-yellow-400 bg-yellow-950'
    return 'text-gray-400 bg-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Signal Feed</h1>
          <p className="text-gray-400 text-sm">Live celebrity news detection from free sources</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {Object.entries(sources).map(([source, status]) => (
            <div key={source} className="flex items-center gap-2">
              <span className="text-gray-400 capitalize">{source.replace('_', ' ')}:</span>
              <span className={status === 'connected' ? 'text-green-400' : 'text-red-400'}>
                {status === 'connected' ? '●' : '○'} {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Manual Signal */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <h2 className="text-sm font-semibold mb-3">Add Manual Signal</h2>
        <form className="flex gap-3">
          <input
            type="text"
            placeholder="Subject (e.g., Taylor Swift)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Signal type"
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition"
          >
            Add Signal
          </button>
        </form>
      </div>

      {/* Signals List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading signals...</div>
        ) : signals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No signals detected yet. Start the OSINT agent to begin monitoring.
          </div>
        ) : (
          signals.map((signal) => (
            <div key={signal.id} className="bg-gray-900 rounded-lg p-5 border border-gray-800">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{signal.subject}</h3>
                  <p className="text-gray-400 text-sm">
                    {new Date(signal.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${getScoreColor(signal.viralityScore)}`}>
                    Score: {signal.viralityScore}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    signal.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                    signal.status === 'queued' ? 'bg-blue-900 text-blue-300' :
                    'bg-green-900 text-green-300'
                  }`}>
                    {signal.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Primary Signal</p>
                  <p className="text-sm bg-gray-800 rounded px-2 py-1 inline-block">
                    {signal.primarySignal}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Secondary Signal</p>
                  <p className="text-sm bg-gray-800 rounded px-2 py-1 inline-block">
                    {signal.secondarySignal}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {signal.platforms.map((platform) => (
                    <span key={platform} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                      {platform.replace('_', ' ')}
                    </span>
                  ))}
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                    confidence: {signal.confidence}/3
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm text-blue-400 hover:text-blue-300 transition">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
