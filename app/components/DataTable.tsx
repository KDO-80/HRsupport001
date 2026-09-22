'use client'

import { useEffect, useState } from 'react'

interface DataTableProps {
  type: 'contracts' | 'vehicles' | 'rentals'
  refreshTrigger: number
}

export function DataTable({ type, refreshTrigger }: DataTableProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [type, refreshTrigger])

  const fetchData = async () => {
    setLoading(true)
    try {
      const endpoint = {
        contracts: '/api/contracts',
        vehicles: '/api/vehicles',
        rentals: '/api/rentals'
      }[type]

      const res = await fetch(`http://localhost:8000${endpoint}`)
      const result = await res.json()
      setData(Array.isArray(result) ? result : [])
    } catch (error) {
      console.error('데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        데이터가 없습니다. 파일을 업로드하세요.
      </div>
    )
  }

  const columns = {
    contracts: ['contract_no', 'contract_name', 'start_date', 'end_date', 'manager'],
    vehicles: ['vehicle_no', 'vehicle_type', 'region', 'fuel_type', 'owner'],
    rentals: ['region', 'office', 'rental_type', 'quantity']
  }[type]

  const labels = {
    contracts: { contract_no: '계약번호', contract_name: '계약명', start_date: '시작', end_date: '종료', manager: '담당자' },
    vehicles: { vehicle_no: '차량번호', vehicle_type: '차종', region: '지역', fuel_type: '유종', owner: '보유사' },
    rentals: { region: '권역', office: '사옥', rental_type: '렌탈구분', quantity: '수량' }
  }[type] as Record<string, string>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 border-b">
          <tr>
            {columns.map(col => (
              <th key={col} className="px-4 py-3 text-left font-semibold text-gray-700">
                {labels[col]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50">
              {columns.map(col => (
                <td key={col} className="px-4 py-3 text-gray-700">
                  {String(row[col] || '-').substring(0, 30)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-600 mt-3">
        💬 총 {data.length}개 행 (상위 10개만 표시)
      </p>
    </div>
  )
}
