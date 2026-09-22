'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false })
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false })
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false })
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })

interface ChartsProps {
  type: 'contracts' | 'vehicles' | 'rentals'
  refreshTrigger: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function Charts({ type, refreshTrigger }: ChartsProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [type, refreshTrigger])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const endpoint = {
        contracts: '/api/contract-stats',
        vehicles: '/api/vehicle-stats',
        rentals: '/api/rental-stats'
      }[type]

      const res = await fetch(`http://localhost:8000${endpoint}`)
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('통계 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">차트 로딩 중...</div>
  }

  return (
    <div className="space-y-8">
      {type === 'contracts' && data && (
        <div>
          <h3 className="font-semibold mb-4">계약 상태 분포</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width={300} height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(data).map(([name, value]) => ({ name, value }))}
                  cx={150}
                  cy={150}
                  outerRadius={100}
                  label
                  dataKey="value"
                >
                  {Object.keys(data).map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {type === 'vehicles' && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-4">유종별 차량 현황</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width={300} height={300}>
                <PieChart>
                  <Pie
                    data={data.by_fuel}
                    cx={150}
                    cy={150}
                    outerRadius={100}
                    label
                    dataKey="value"
                  >
                    {data.by_fuel.map((_: any, idx: number) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">차종별 차량 현황</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width={400} height={300}>
                <BarChart data={data.by_type}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {type === 'rentals' && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-4">권역별 렌탈 현황</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width={400} height={300}>
                <BarChart data={data.by_region}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">렌탈구분별 현황</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width={300} height={300}>
                <PieChart>
                  <Pie
                    data={data.by_type}
                    cx={150}
                    cy={150}
                    outerRadius={100}
                    label
                    dataKey="value"
                  >
                    {data.by_type.map((_: any, idx: number) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
