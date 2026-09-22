'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'

interface FileUploaderProps {
  type: 'contracts' | 'vehicles' | 'rentals'
  onSuccess: () => void
}

export function FileUploader({ type, onSuccess }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleFile = async (file: File | undefined) => {
    if (!file || !file.name.endsWith('.xlsx')) {
      setMessage('❌ .xlsx 파일만 업로드 가능합니다')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`http://localhost:8000/api/upload/${type}`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (data.status === 'success') {
        setMessage(`✅ ${data.rows}개 행 업로드 완료!`)
        onSuccess()
      } else {
        setMessage(`❌ 오류: ${data.message}`)
      }
    } catch (error) {
      setMessage('❌ 업로드 실패')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <label
        onDragOver={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full px-8 py-12 border-2 border-dashed rounded-lg cursor-pointer transition ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:bg-gray-50'
        }`}
      >
        <Upload className="w-10 h-10 mb-3 text-gray-600" />
        <p className="text-lg font-medium text-gray-900">엑셀 파일 드래그 & 드롭</p>
        <p className="text-sm text-gray-600">또는 클릭하여 선택</p>
        <input
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={isLoading}
        />
      </label>
      {message && (
        <p className={`mt-3 text-center font-medium ${
          message.includes('✅') ? 'text-green-600' : 'text-red-600'
        }`}>
          {message}
        </p>
      )}
      {isLoading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}
