'use client'

import { useState } from 'react'

export default function ViralPage() {
  const [generating, setGenerating] = useState(false)
  const [tiktok, setTiktok] = useState({
    hook: "You won't believe what just happened with Beyoncé...",
    fact1: "Court documents were filed today in LA",
    fact2: "The filing appears to involve asset division",
    fact3: "Beyoncé's team has not yet commented",
    closingLoop: "Follow for updates as this story develops"
  })
  const [xThread, setXThread] = useState([
    { num: 1, text: '🚨 BREAKING: Court documents just dropped involving Beyoncé. This is not a drill.', isHook: true },
    { num: 2, text: 'LA Superior Court filings from today reveal...', isFact: false },
    { num: 3, text: '• Filing type: Unknown at this time', isFact: true },
    { num: 4, text: '• Court: LA Superior Court', isFact: true },
    { num: 5, text: '• Beyoncé\'s legal team has not responded to requests for comment.', isFact: true },
    { num: 6, text: 'This is still developing. More to come.', isReveal: true },
    { num: 7, text: 'Follow for the latest updates on this developing story 🏆', isClosing: true }
  ])

  async function regenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/viral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article: {} })
      })
      const data = await res.json()
      if (data.tiktok) setTiktok(data.tiktok)
      if (data.xThread) setXThread(data.xThread)
    } catch (error) {
      console.error('Failed to generate:', error)
    } finally {
      setGenerating(false)
    }
  }

  function updateXPost(num: number, text: string) {
    setXThread(xThread.map(p => p.num === num ? { ...p, text } : p))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Viral Assets</h1>
          <p className="text-gray-400 text-sm">TikTok scripts and X threads ready for publishing</p>
        </div>
        <button
          onClick={regenerate}
          disabled={generating}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition"
        >
          {generating ? 'Generating...' : 'Regenerate'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* TikTok Script */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">TikTok Script</h2>
              <span className="text-xs bg-red-600 px-2 py-1 rounded">45 sec max</span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-red-400 font-medium mb-1">HOOK (0-3s)</p>
                <textarea
                  value={tiktok.hook}
                  onChange={(e) => setTiktok({ ...tiktok, hook: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  rows={2}
                />
              </div>

              <div>
                <p className="text-xs text-blue-400 font-medium mb-1">FACT 1 (3-15s)</p>
                <textarea
                  value={tiktok.fact1}
                  onChange={(e) => setTiktok({ ...tiktok, fact1: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  rows={2}
                />
              </div>

              <div>
                <p className="text-xs text-blue-400 font-medium mb-1">FACT 2 (15-27s)</p>
                <textarea
                  value={tiktok.fact2}
                  onChange={(e) => setTiktok({ ...tiktok, fact2: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  rows={2}
                />
              </div>

              <div>
                <p className="text-xs text-blue-400 font-medium mb-1">FACT 3 (27-39s)</p>
                <textarea
                  value={tiktok.fact3}
                  onChange={(e) => setTiktok({ ...tiktok, fact3: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  rows={2}
                />
              </div>

              <div>
                <p className="text-xs text-green-400 font-medium mb-1">CLOSING (39-45s)</p>
                <textarea
                  value={tiktok.closingLoop}
                  onChange={(e) => setTiktok({ ...tiktok, closingLoop: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded text-sm transition">
                Copy Script
              </button>
            </div>
          </div>
        </div>

        {/* X Thread */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">X Thread</h2>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">{xThread.length} posts</span>
            </div>

            <div className="space-y-3">
              {xThread.map((post) => (
                <div key={post.num} className="flex gap-3">
                  <span className={`text-sm font-medium pt-1 ${
                    post.isHook ? 'text-red-400' :
                    post.isReveal ? 'text-yellow-400' :
                    post.isClosing ? 'text-green-400' :
                    'text-gray-500'
                  }`}>
                    {post.num}.
                  </span>
                  <textarea
                    value={post.text}
                    onChange={(e) => updateXPost(post.num, e.target.value)}
                    className={`flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm ${
                      post.isHook ? 'border-red-900' : ''
                    }`}
                    rows={2}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded text-sm transition">
                Copy Thread
              </button>
            </div>
          </div>

          {/* Thread Preview */}
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h3 className="text-sm font-semibold mb-3">Thread Preview</h3>
            <div className="bg-black rounded-lg p-4 space-y-3">
              {xThread.map((post) => (
                <div key={post.num} className="border-b border-gray-800 pb-2 last:border-0">
                  <p className="text-sm">{post.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
