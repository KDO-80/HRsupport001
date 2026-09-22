'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { FileUploader } from './components/FileUploader'
import { DataTable } from './components/DataTable'
import { Charts } from './components/Charts'
import { StatsSummary } from './components/StatsSummary'
import { AlertBanner } from './components/AlertBanner'
import { AIChat } from './components/AIChat'
import { exportToPDF } from './lib/pdf-export'

export default function Home() {
  const [stats, setStats] = useState({ contracts_count: 0, vehicles_count: 0, rentals_count: 0 })
  const [activeTab, setActiveTab] = useState<'contracts' | 'vehicles' | 'rentals' | 'ai'>('contracts')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    fetch('http://localhost:8000/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => console.log('Backend not running'))
  }, [refreshTrigger])

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const tabConfig = [
    { id: 'contracts' as const, label: '📋 계약 관리', color: 'blue' },
    { id: 'vehicles' as const, label: '🚗 차량 현황', color: 'green' },
    { id: 'rentals' as const, label: '📦 렌탈 비품', color: 'purple' },
    { id: 'ai' as const, label: '🤖 AI Q&A', color: 'indigo' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900">
      <nav className="bg-slate-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-white">📊 총무팀 통합 대시보드</h1>
          <p className="text-gray-400 text-sm mt-1">계약 · 차량 · 렌탈 비품 통합 관리 시스템</p>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AlertBanner refreshTrigger={refreshTrigger} />

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: '📋 계약', count: stats.contracts_count, color: 'blue' },
            { label: '🚗 차량', count: stats.vehicles_count, color: 'green' },
            { label: '📦 비품', count: stats.rentals_count, color: 'purple' }
          ].map(({ label, count, color }) => (
            <div key={label} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <p className="text-gray-600 text-sm">{label}</p>
              <p className={`text-4xl font-bold mt-2 text-${color}-600`}>{count}</p>
            </div>
          ))}
        </div>

        {/* 대시보드 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b bg-gray-50 px-6 py-4 flex justify-between items-center">
            <div className="flex">
              {tabConfig.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? `border-${tab.color}-600 text-${tab.color}-600 bg-white`
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => exportToPDF('dashboard-content', `${activeTab}-report`)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Download className="w-4 h-4" />
              PDF 다운로드
            </button>
          </div>

          <div id="dashboard-content" className="p-8 space-y-8">
            {activeTab === 'ai' ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">🤖 AI 데이터 분석 및 Q&A</h3>
                <AIChat />
              </div>
            ) : (
              <>
                <StatsSummary type={activeTab} refreshTrigger={refreshTrigger} />

                <div>
                  <h3 className="text-lg font-semibold mb-4">📤 파일 업로드</h3>
                  <FileUploader type={activeTab} onSuccess={handleUploadSuccess} />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">📈 통계 분석</h3>
                  <Charts type={activeTab} refreshTrigger={refreshTrigger} />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">📊 데이터 목록</h3>
                  <DataTable type={activeTab} refreshTrigger={refreshTrigger} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
