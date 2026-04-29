'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Save, Camera, CheckCircle, XCircle } from 'lucide-react'
import { getCurrentUser, updateUser, getUsers } from '@/lib/storage'
import type { User as UserType } from '@/types'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    setName(currentUser.name)
    setEmail(currentUser.email)
  }, [router])

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (user) {
      updateUser(user.id.toString(), { name, email })
      
      // Обновляем текущего пользователя в localStorage
      const updatedUser = { ...user, name, email }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      
      setMessage({ type: 'success', text: '✅ Профиль успешно обновлен!' })
      setUser(updatedUser)
    }

    setLoading(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '❌ Новые пароли не совпадают' })
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '❌ Пароль должен быть минимум 6 символов' })
      setLoading(false)
      return
    }

    // Проверяем старый пароль
    const storedPassword = localStorage.getItem(`password_${user?.email}`)

    if (storedPassword !== oldPassword) {
      setMessage({ type: 'error', text: '❌ Неверный текущий пароль' })
      setLoading(false)
      return
    }

    // Сохраняем новый пароль
    localStorage.setItem(`password_${user?.email}`, newPassword)
    
    // Обновляем в users
    const users = getUsers()
    const updatedUsers = users.map(u => 
      u.id === user?.id ? { ...u, password: newPassword } : u
    )
    localStorage.setItem('users', JSON.stringify(updatedUsers))

    setMessage({ type: 'success', text: '✅ Пароль успешно изменен!' })
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setLoading(false)
    setTimeout(() => setMessage(null), 3000)
  }

  if (!user) return <div className="text-center py-12">Загрузка...</div>

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">👤 Личный профиль</h1>

      {/* Сообщение */}
      {message && (
        <div className={`mb-4 p-3 rounded-md flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Аватар и основная информация */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-3xl text-white font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
            <p className="text-gray-500">
              {user.role === 'teacher' ? '👨‍🏫 Учитель' : '👨‍🎓 Ученик'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              📅 Дата регистрации: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>

        {/* Форма редактирования профиля */}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <h3 className="font-semibold text-gray-900">Основная информация</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя и фамилия</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Сохранить изменения
          </button>
        </form>
      </div>

      {/* Смена пароля */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <h3 className="font-semibold text-gray-900">🔒 Смена пароля</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Текущий пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Введите текущий пароль"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Минимум 6 символов"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Подтвердите новый пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Повторите новый пароль"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            Сменить пароль
          </button>
        </form>
      </div>

      {/* Статистика */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">📊 Статистика</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {user.role === 'teacher' ? '0' : '0'}
            </div>
            <div className="text-sm text-gray-600">Созданных классов</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {user.role === 'student' ? '0' : '0'}
            </div>
            <div className="text-sm text-gray-600">Пройденных тестов</div>
          </div>
        </div>
      </div>
    </div>
  )
}