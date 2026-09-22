'use client'

import { useRef, useState } from 'react'
import { Download } from 'lucide-react'

interface PDFExporterProps {
  type: 'contracts' | 'vehicles' | 'rentals'
  contentId: string
}

export function PDFExporter({ type, contentId }: PDFExporterProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const downloadPDF = async () => {
    if (!contentRef.current) return

    setIsLoading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default

      const element = contentRef.current
      const opt = {
        margin: 10,
        filename: `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      }

      html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error('PDF 생성 실패:', error)
      alert('PDF 다운로드에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={downloadPDF}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
      >
        <Download className="w-4 h-4" />
        {isLoading ? '생성 중...' : 'PDF 다운로드'}
      </button>

      <div ref={contentRef} className="hidden">
        <div id={contentId} />
      </div>
    </>
  )
}
