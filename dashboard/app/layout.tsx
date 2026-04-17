import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TMZ-Killer Dashboard',
  description: 'Celebrity news automation dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white">
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-red-500">TMZ-Killer</h1>
              <div className="flex gap-6 text-sm">
                <a href="/signals" className="hover:text-red-400 transition">Signals</a>
                <a href="/queue" className="hover:text-red-400 transition">Queue</a>
                <a href="/articles" className="hover:text-red-400 transition">Articles</a>
                <a href="/viral" className="hover:text-red-400 transition">Viral</a>
                <a href="/settings" className="hover:text-red-400 transition">Settings</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">Pipeline: Active</span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  )
}
