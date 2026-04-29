'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, BookOpen, LogOut, Menu, X, User as UserIcon, Plus } from 'lucide-react'
import { getCurrentUser, setCurrentUser } from '@/lib/storage'
import NotificationBell from '@/components/NotificationBell'
import type { User } from '@/types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
  }, [router])

  const handleLogout = () => {
    setCurrentUser(null)
    router.push('/login')
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Мобильная кнопка меню */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200 transition-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Classroom Clone</h1>
          <p className="text-sm text-gray-600 mt-1">{user.name}</p>
          <span className="inline-block px-2 py-0.5 mt-1 text-xs rounded-full bg-blue-100 text-blue-700">
            {user.role === 'teacher' ? 'Учитель' : 'Ученик'}
          </span>
        </div>
        
        <nav className="p-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setSidebarOpen(false)}
          >
            <Home className="w-5 h-5" />
            <span>Главная</span>
          </Link>
          <Link
            href="/classes"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setSidebarOpen(false)}
          >
            <BookOpen className="w-5 h-5" />
            <span>Все классы</span>
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setSidebarOpen(false)}
          >
            <UserIcon className="w-5 h-5" />
            <span>Профиль</span>
          </Link>
          {user.role === 'teacher' && (
            <Link
              href="/classes/create"
              className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setSidebarOpen(false)}
            >
              <Plus className="w-5 h-5" />
              <span>Создать класс</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Выйти</span>
          </button>
        </nav>
      </aside>

      {/* Основной контент */}
      <main className="lg:ml-64 min-h-screen">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex justify-end items-center px-6 py-3">
            <NotificationBell />
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Оверлей для мобильного меню */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}