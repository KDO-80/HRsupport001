'use client'

import { useEffect, useState } from 'react'

interface StatsSummaryProps {
  type: 'contracts' | 'vehicles' | 'rentals'
  refreshTrigger: number
}

export function StatsSummary({ type, refreshTrigger }: StatsSummaryProps) {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [type, refreshTrigger])

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const endpoint = {
        contracts: '/api/contract-stats',
        vehicles: '/api/vehicle-stats',
        rentals: '/api/rental-stats'
      }[type]

      const res = await fetch(`http://localhost:8000${endpoint}`)
      const result = await res.json()
      setSummary(result)
    } catch (error) {
      console.error('요약 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !summary) return null

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
      <h3 className="font-semibold text-lg mb-4">📌 빠른 통계</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {type === 'contracts' && (
          <>
            {Object.entries(summary).map(([status, count]: any) => (
              <div key={status} className="bg-white rounded p-4 text-center shadow-sm">
                <p className="text-gray-600 text-sm">{status}</p>
                <p className="text-2xl font-bold text-blue-600">{count}</p>
              </div>
            ))}
          </>
        )}

        {type === 'vehicles' && (
          <>
            {summary.by_fuel.map((item: any) => (
              <div key={item.name} className="bg-white rounded p-4 text-center shadow-sm">
                <p className="text-gray-600 text-sm">{item.name}</p>
                <p className="text-2xl font-bold text-green-600">{item.value}</p>
              </div>
            ))}
          </>
        )}

        {type === 'rentals' && (
          <>
            {summary.by_region.slice(0, 4).map((item: any) => (
              <div key={item.name} className="bg-white rounded p-4 text-center shadow-sm">
                <p className="text-gray-600 text-sm">{item.name}</p>
                <p className="text-2xl font-bold text-purple-600">{item.value}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
