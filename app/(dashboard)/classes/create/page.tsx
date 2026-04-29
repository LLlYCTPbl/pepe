'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { getCurrentUser, generateId } from '@/lib/storage'
import type { User, Classroom } from '@/types'

const coverColors = [
  'bg-gradient-to-r from-blue-500 to-purple-600',
  'bg-gradient-to-r from-green-500 to-teal-500',
  'bg-gradient-to-r from-red-500 to-orange-500',
  'bg-gradient-to-r from-pink-500 to-rose-500',
  'bg-gradient-to-r from-indigo-500 to-blue-500',
  'bg-gradient-to-r from-yellow-500 to-amber-500',
]

export default function CreateClassPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState(coverColors[0])

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (currentUser.role !== 'teacher') {
      router.push('/dashboard')
      return
    }
    setUser(currentUser)
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const newClass: Classroom = {
      id: generateId(),
      name: formData.get('name') as string,
      section: formData.get('section') as string,
      subject: formData.get('subject') as string,
      room: formData.get('room') as string,
      teacherId: user!.id,
      teacherName: user!.name,
      coverColor: selectedColor,
      createdAt: new Date().toISOString(),
      inviteCode: inviteCode
    }

    const existingClasses = JSON.parse(localStorage.getItem('classes') || '[]')
    existingClasses.push(newClass)
    localStorage.setItem('classes', JSON.stringify(existingClasses))
    
    await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClass)
    })
    
    const allClasses = JSON.parse(localStorage.getItem('classes') || '[]')
    await fetch('/api/classes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allClasses)
    })
    
    alert(`✅ Класс "${newClass.name}" создан!\n\n🔑 Код приглашения: ${inviteCode}`)
    router.push('/dashboard')
  }

  if (!user) return <div className="text-center py-12">Загрузка...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Создать новый класс</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название класса *
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Например: 10А класс"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Предмет *
            </label>
            <input
              name="subject"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Например: Математика"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Секция / Параллель
            </label>
            <input
              name="section"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Например: 10А"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Кабинет
            </label>
            <input
              name="room"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Например: 301"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цвет обложки
            </label>
            <div className="flex gap-3 flex-wrap">
              {coverColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-lg ${color} ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Создание...' : 'Создать класс'}
          </button>
        </form>
      </div>
    </div>
  )
}