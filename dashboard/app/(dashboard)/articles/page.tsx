'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ArticlesPage() {
  const searchParams = useSearchParams()
  const itemId = searchParams.get('item')

  const [article, setArticle] = useState({
    headline: itemId ? 'BREAKING: Beyoncé Files Legal Documents — What We Know' : '',
    deck: itemId ? 'Court filings reveal unexpected developments in a major celebrity case' : '',
    who: itemId ? 'Beyoncé Knowles-Carter' : '',
    what: itemId ? 'Legal filing detected in LA Superior Court' : '',
    when: itemId ? 'April 17, 2026' : '',
    where: itemId ? 'Los Angeles Superior Court' : '',
    why: itemId ? 'Documents appear related to asset division' : '',
    keyFacts: itemId ? [
      'Filing type: Unknown at this time',
      'Court: LA Superior Court',
      'Case status: Active'
    ] : ['', '', ''],
    background: itemId ? 'Multiple sources have indicated this is a significant legal development. The filing comes amid...' : '',
    whatThisMeans: itemId ? 'This is a developing story. Follow for updates.' : ''
  })

  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave() {
    setSaving(true)
    // Simulate save
    await new Promise(r => setTimeout(r, 500))
    setSaving(false)
    setMessage('Article saved!')
    setTimeout(() => setMessage(''), 3000)
  }

  async function handlePublish() {
    if (!confirm('Publish to WordPress?')) return
    setPublishing(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article,
          queueItemId: itemId
        })
      })
      const data = await res.json()
      if (data.success) {
        setMessage(`Published! URL: ${data.postUrl}`)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to publish')
    } finally {
      setPublishing(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  function updateKeyFact(index: number, value: string) {
    const newFacts = [...article.keyFacts]
    newFacts[index] = value
    setArticle({ ...article, keyFacts: newFacts })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Article Editor</h1>
          <p className="text-gray-400 text-sm">Edit and publish your article</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm transition"
          >
            {publishing ? 'Publishing...' : 'Publish to WordPress'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes('Error') || message.includes('Failed') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-4">
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <label className="block text-sm font-medium mb-2">Headline</label>
            <input
              type="text"
              value={article.headline}
              onChange={(e) => setArticle({ ...article, headline: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-lg font-semibold"
            />
          </div>

          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <label className="block text-sm font-medium mb-2">Deck (Subheadline)</label>
            <textarea
              value={article.deck}
              onChange={(e) => setArticle({ ...article, deck: e.target.value })}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3"
            />
          </div>

          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h3 className="font-semibold mb-4">Article Body</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Who</label>
                <input
                  type="text"
                  value={article.who}
                  onChange={(e) => setArticle({ ...article, who: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">What</label>
                <input
                  type="text"
                  value={article.what}
                  onChange={(e) => setArticle({ ...article, what: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">When</label>
                <input
                  type="text"
                  value={article.when}
                  onChange={(e) => setArticle({ ...article, when: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Where</label>
                <input
                  type="text"
                  value={article.where}
                  onChange={(e) => setArticle({ ...article, where: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs text-gray-500 mb-1">Why</label>
              <input
                type="text"
                value={article.why}
                onChange={(e) => setArticle({ ...article, why: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h3 className="font-semibold mb-4">Key Facts</h3>
            <div className="space-y-3">
              {article.keyFacts.map((fact, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-gray-500 pt-2">•</span>
                  <input
                    type="text"
                    value={fact}
                    onChange={(e) => updateKeyFact(i, e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <label className="block text-sm font-medium mb-2">Background</label>
            <textarea
              value={article.background}
              onChange={(e) => setArticle({ ...article, background: e.target.value })}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-sm"
            />
          </div>

          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <label className="block text-sm font-medium mb-2">What This Means</label>
            <textarea
              value={article.whatThisMeans}
              onChange={(e) => setArticle({ ...article, whatThisMeans: e.target.value })}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-sm"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h3 className="font-semibold mb-3">SEO Preview</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Meta Title</p>
                <p className="bg-gray-800 rounded px-2 py-1 mt-1">{article.headline.slice(0, 60)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Meta Description</p>
                <p className="bg-gray-800 rounded px-2 py-1 mt-1 text-xs">{article.deck.slice(0, 160)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h3 className="font-semibold mb-3">Viral Assets</h3>
            <button
              onClick={() => window.location.href = '/viral'}
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition"
            >
              Generate TikTok + X Thread
            </button>
          </div>

          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h3 className="font-semibold mb-3">Preview</h3>
            <div className="bg-gray-800 rounded p-3 text-xs">
              <p className="font-bold">{article.headline || 'Headline...'}</p>
              <p className="text-gray-400 mt-1">{article.deck || 'Deck...'}</p>
              <div className="mt-3 space-y-1 text-gray-300">
                <p><strong>Who:</strong> {article.who || '...'}</p>
                <p><strong>What:</strong> {article.what || '...'}</p>
                <p><strong>When:</strong> {article.when || '...'}</p>
                <p><strong>Where:</strong> {article.where || '...'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
