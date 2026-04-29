'use client'

import { useEffect, useState } from 'react'
import { Bell, X, CheckCircle, FileText, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/storage'

interface Notification {
  id: string
  type: 'new_assignment' | 'new_comment' | 'grade' | 'new_post'
  title: string
  message: string
  link: string
  read: boolean
  createdAt: string
}

export default function NotificationBell() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  // Загружаем уведомления с сервера
  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      
      // Получаем текущего пользователя
      const currentUser = getCurrentUser()
      
      // Фильтруем уведомления для текущего пользователя
      // (в реальном приложении нужно добавлять userId к уведомлениям)
      const userNotifications = data
      
      setNotifications(userNotifications)
      setUnreadCount(userNotifications.filter((n: Notification) => !n.read).length)
    } catch (error) {
      console.log('Ошибка загрузки уведомлений')
    }
  }

  // Периодическая проверка новых уведомлений (каждые 10 секунд)
  useEffect(() => {
    // Первая загрузка
    loadNotifications()
    
    // Интервал для проверки новых уведомлений
    const interval = setInterval(() => {
      loadNotifications()
      setLastChecked(new Date())
    }, 10000) // Проверяем каждые 10 секунд
    
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
    setNotifications(updated)
    setUnreadCount(updated.filter(n => !n.read).length)
    
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
  }

  const clearAll = async () => {
    setNotifications([])
    setUnreadCount(0)
    await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'all' })
    })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_assignment':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'new_comment':
        return <MessageCircle className="w-4 h-4 text-green-500" />
      case 'grade':
        return <CheckCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Уведомления</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {lastChecked.toLocaleTimeString()}
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Очистить все
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  ✨ Новых уведомлений нет
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      markAsRead(notification.id)
                      router.push(notification.link)
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Анимированная иконка обновления */}
            <div className="p-2 border-t border-gray-100 text-center">
              <div className="text-xs text-gray-400 animate-pulse">
                🔄 Обновляется каждые 10 секунд
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}