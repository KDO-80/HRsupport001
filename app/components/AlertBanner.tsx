'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface Alert {
  contract_no: string
  contract_name: string
  manager: string
  days_until: number
  end_date: string
  severity: string
  notified: boolean
}

export function AlertBanner({ refreshTrigger }: { refreshTrigger: number }) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [refreshTrigger])

  const fetchAlerts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/alerts')
      const data = await res.json()
      setAlerts(data.slice(0, 3)) // 상위 3개만 표시
    } catch (error) {
      console.error('알람 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || alerts.length === 0) return null

  return (
    <div className="max-w-7xl mx-auto px-6 mb-6 space-y-3">
      {alerts.map(alert => (
        <div key={alert.contract_no} className="flex items-center gap-4 bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
          <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {alert.contract_name} ({alert.contract_no})
            </p>
            <p className="text-sm text-gray-600">
              담당자: {alert.manager} | {alert.days_until}일 후 만료
            </p>
          </div>
          <span className="text-lg">{alert.severity}</span>
        </div>
      ))}
    </div>
  )
}
