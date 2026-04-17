import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome to TMZ-Killer</h1>
        <p className="text-gray-400 mt-2">Automated celebrity news pipeline — zero cost, maximum velocity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Signals Today', value: '0', color: 'text-blue-400' },
          { label: 'In Queue', value: '0', color: 'text-yellow-400' },
          { label: 'Published', value: '0', color: 'text-green-400' },
          { label: 'Virality Score', value: '--', color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/queue" className="block">
              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition">
                Review Queue →
              </button>
            </Link>
            <Link href="/viral" className="block">
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition">
                Preview Viral Assets →
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Pipeline Status</h2>
          <div className="space-y-3 text-sm">
            {[
              { step: 'OSINT Signal Agent', status: 'idle', color: 'text-gray-500' },
              { step: 'EIC Triage', status: 'idle', color: 'text-gray-500' },
              { step: 'SEO Content', status: 'idle', color: 'text-gray-500' },
              { step: 'Viral Factory', status: 'idle', color: 'text-gray-500' },
              { step: 'WordPress', status: 'idle', color: 'text-gray-500' },
            ].map((step) => (
              <div key={step.step} className="flex justify-between">
                <span>{step.step}</span>
                <span className={step.color}>{step.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-500 text-sm">No recent activity. Start the OSINT agent to begin detecting signals.</p>
      </div>
    </div>
  )
}
