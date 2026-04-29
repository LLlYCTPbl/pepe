'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Mail, Lock, User } from 'lucide-react'
import { generateId, saveUser, setCurrentUser, getUsers } from '@/lib/storage'
import type { User as UserType } from '@/types'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string

    const users = getUsers()
    const existingUser = users.find((u: UserType) => u.email === email)
    
    if (existingUser) {
      setError('Пользователь с таким email уже существует')
      setLoading(false)
      return
    }

    const newUser: UserType = {
      id: generateId(),
      email,
      name,
      role: role as 'teacher' | 'student',
      createdAt: new Date().toISOString()
    }
    
    localStorage.setItem(`password_${email}`, password)
    saveUser(newUser)
    setCurrentUser(newUser)

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <UserPlus className="w-12 h-12 text-blue-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">Регистрация</h1>
          <p className="text-gray-600">Создайте новый аккаунт</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя и фамилия</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                name="name"
                type="text"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Иван Иванов"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                name="email"
                type="email"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="example@mail.ru"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Минимум 6 символов"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
            <select
              name="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="student">Ученик</option>
              <option value="teacher">Учитель</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}