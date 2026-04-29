'use client'

import { useState } from 'react'
import { getCurrentUser } from '@/lib/storage'

export default function SyncPage() {
  const [exportData, setExportData] = useState('')
  const [importStatus, setImportStatus] = useState('')

  const handleExport = () => {
    const data = {
      classes: JSON.parse(localStorage.getItem('classes') || '[]'),
      assignments: JSON.parse(localStorage.getItem('assignments') || '[]'),
      posts: JSON.parse(localStorage.getItem('posts') || '[]'),
      comments: JSON.parse(localStorage.getItem('comments') || '[]')
    }
    const jsonStr = JSON.stringify(data, null, 2)
    setExportData(jsonStr)
    navigator.clipboard.writeText(jsonStr)
    alert('Данные скопированы в буфер обмена!')
  }

  const handleImport = () => {
    try {
      const data = JSON.parse(exportData)
      if (data.classes) localStorage.setItem('classes', JSON.stringify(data.classes))
      if (data.assignments) localStorage.setItem('assignments', JSON.stringify(data.assignments))
      if (data.posts) localStorage.setItem('posts', JSON.stringify(data.posts))
      if (data.comments) localStorage.setItem('comments', JSON.stringify(data.comments))
      setImportStatus('✅ Данные успешно импортированы!')
      setTimeout(() => window.location.reload(), 1000)
    } catch {
      setImportStatus('❌ Ошибка: неверный формат данных')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Синхронизация данных</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="font-medium mb-2">Для учителя:</p>
        <button onClick={handleExport} className="bg-blue-600 text-white px-4 py-2 rounded">
          Экспортировать данные (скопировать)
        </button>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <p className="font-medium mb-2">Для ученика:</p>
        <textarea
          value={exportData}
          onChange={(e) => setExportData(e.target.value)}
          placeholder="Вставьте сюда данные от учителя..."
          className="w-full h-40 p-2 border rounded mb-2 font-mono text-sm"
        />
        <button onClick={handleImport} className="bg-green-600 text-white px-4 py-2 rounded">
          Импортировать данные
        </button>
        {importStatus && <p className="mt-2 text-sm">{importStatus}</p>}
      </div>
    </div>
  )
}