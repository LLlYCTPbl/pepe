'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Plus, RefreshCw } from 'lucide-react'
import { getCurrentUser, getEnrollments, addEnrollment, generateId } from '@/lib/storage'
import type { User, Classroom, Enrollment } from '@/types'

export default function ClassesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [myClasses, setMyClasses] = useState<Classroom[]>([])
  const [inviteCode, setInviteCode] = useState('')
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    
    try {
      const response = await fetch('/api/classes')
      const serverClasses = await response.json()
      
      if (serverClasses.length > 0) {
        localStorage.setItem('classes', JSON.stringify(serverClasses))
      }
    } catch (error) {}
    
    const allClasses = JSON.parse(localStorage.getItem('classes') || '[]')
    
    if (currentUser.role === 'student') {
      const enrollments = getEnrollments()
      const myClassIds = enrollments.filter(e => e.studentId === currentUser.id).map(e => e.classroomId)
      const enrolledClasses = allClasses.filter(c => myClassIds.includes(c.id))
      setMyClasses(enrolledClasses)
    } else {
      const teacherClasses = allClasses.filter(c => c.teacherId === currentUser.id)
      setMyClasses(teacherClasses)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleJoinClass = async () => {
    if (!user) return
    if (!inviteCode.trim()) {
      setJoinError('Введите код приглашения')
      return
    }
    
    setJoining(true)
    setJoinError('')
    
    const code = inviteCode.trim().toUpperCase()
    
    try {
      const response = await fetch('/api/classes/check-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        setJoinError(`Класс с кодом "${code}" не найден`)
        setJoining(false)
        return
      }
      
      const classToJoin = result.classroom
      
      const existingClasses = JSON.parse(localStorage.getItem('classes') || '[]')
      if (!existingClasses.find((c: any) => c.id === classToJoin.id)) {
        existingClasses.push(classToJoin)
        localStorage.setItem('classes', JSON.stringify(existingClasses))
      }
      
      const newEnrollment: Enrollment = {
        id: generateId(),
        classroomId: classToJoin.id,
        studentId: user.id,
        studentName: user.name,
        enrolledAt: new Date().toISOString()
      }
      
      addEnrollment(newEnrollment)
      await fetch('/api/enrollments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newEnrollment)
});
      
      alert(`✅ Вы присоединились к классу "${classToJoin.name}"!`)
      setInviteCode('')
      setShowJoinModal(false)
      setJoining(false)
      loadData()
    } catch (error) {
      setJoinError('Ошибка соединения с сервером')
      setJoining(false)
    }
  }

  if (loading) return <div className="text-center py-12">Загрузка...</div>
  if (!user) return null

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Мои классы</h1>
        <div className="flex gap-2">
          <button onClick={() => loadData()} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <RefreshCw className="w-4 h-4" />
          </button>
          {user.role === 'student' && (
            <button onClick={() => setShowJoinModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Users className="w-4 h-4" />
              Присоединиться
            </button>
          )}
          {user.role === 'teacher' && (
            <Link href="/classes/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Создать класс
            </Link>
          )}
        </div>
      </div>

      {myClasses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">
            {user.role === 'teacher' ? 'У вас пока нет созданных классов' : 'Вы пока не присоединились ни к одному классу'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myClasses.map((classroom) => (
            <Link key={classroom.id} href={`/classes/${classroom.id}`} className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
              <div className={`h-24 ${classroom.coverColor || 'bg-gradient-to-r from-blue-500 to-purple-600'}`} />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{classroom.name}</h3>
                <p className="text-sm text-gray-500">{classroom.subject}</p>
                <p className="text-xs text-gray-400 mt-2">{classroom.section}</p>
                <p className="text-xs text-gray-400">Учитель: {classroom.teacherName}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Присоединиться к классу</h2>
            <p className="text-gray-600 mb-4">Введите код приглашения</p>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setJoinError('') }}
              placeholder="Например: ABC123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-gray-900 uppercase font-mono text-center text-xl"
              autoFocus
            />
            {joinError && <p className="text-red-600 text-sm mb-4">{joinError}</p>}
            <div className="flex gap-3">
              <button onClick={handleJoinClass} disabled={joining} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {joining ? 'Проверка...' : 'Присоединиться'}
              </button>
              <button onClick={() => { setShowJoinModal(false); setInviteCode(''); setJoinError('') }} className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}