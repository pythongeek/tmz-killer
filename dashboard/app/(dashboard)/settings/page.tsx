'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [envVars, setEnvVars] = useState({
    WORDPRESS_SITE_URL: 'https://your-wordpress.com',
    WORDPRESS_USERNAME: 'admin',
    WORDPRESS_APP_PASSWORD: ''
  })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    // In production, save to Vercel environment variables
    localStorage.setItem('tmz_settings', JSON.stringify(envVars))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-400 text-sm">Configure your WordPress connection and pipeline</p>
      </div>

      {saved && (
        <div className="bg-green-900 text-green-300 p-3 rounded-lg text-sm">
          Settings saved! Deploy to Vercel to apply environment variables.
        </div>
      )}

      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 space-y-4">
        <h2 className="font-semibold">WordPress Configuration</h2>
        <p className="text-sm text-gray-400">
          Get your App Password from WordPress Admin → Users → Profile → Application Passwords
        </p>

        <div>
          <label className="block text-sm text-gray-400 mb-1">WordPress Site URL</label>
          <input
            type="url"
            value={envVars.WORDPRESS_SITE_URL}
            onChange={(e) => setEnvVars({ ...envVars, WORDPRESS_SITE_URL: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            placeholder="https://your-wordpress.com"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">WordPress Username</label>
          <input
            type="text"
            value={envVars.WORDPRESS_USERNAME}
            onChange={(e) => setEnvVars({ ...envVars, WORDPRESS_USERNAME: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">WordPress App Password</label>
          <input
            type="password"
            value={envVars.WORDPRESS_APP_PASSWORD}
            onChange={(e) => setEnvVars({ ...envVars, WORDPRESS_APP_PASSWORD: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            placeholder="xxxx xxxx xxxx xxxx"
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-sm transition"
        >
          Save Settings
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 space-y-4">
        <h2 className="font-semibold">Deployment</h2>
        <p className="text-sm text-gray-400">
          Deploy this dashboard to Vercel for free hosting. The dashboard runs entirely on Vercel's edge network with no server costs.
        </p>
        <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
          <p className="text-gray-400"># Deploy to Vercel (free)</p>
          <p className="text-green-400">cd dashboard</p>
          <p className="text-green-400">npm install</p>
          <p className="text-green-400">vercel</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 space-y-4">
        <h2 className="font-semibold">Free Data Sources</h2>
        <div className="space-y-3 text-sm">
          {[
            { name: 'OpenSky Network', desc: 'Private jet flight data (no API key)', status: 'Connected' },
            { name: 'Reddit API', desc: 'Celebrity gossip from r/DeuxMoi, r/FauxMoI', status: 'Connected' },
            { name: 'Google Trends', desc: 'RSS feed for trending celebrity searches', status: 'Connected' },
            { name: 'Court Websites', desc: 'LA Superior, NY, Miami-Dade (free search)', status: 'Connected' }
          ].map((source) => (
            <div key={source.name} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{source.name}</p>
                <p className="text-gray-500 text-xs">{source.desc}</p>
              </div>
              <span className="text-xs text-green-400 bg-green-900 px-2 py-1 rounded">{source.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
