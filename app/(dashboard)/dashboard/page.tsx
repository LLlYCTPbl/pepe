'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Users, Calendar, Award, Plus } from 'lucide-react'
import { getCurrentUser, getClasses, getEnrollments, getClassStudents } from '@/lib/storage'
import type { User, Classroom } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [myClasses, setMyClasses] = useState<Classroom[]>([])
  const [stats, setStats] = useState({ classes: 0, students: 0, assignments: 0 })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)

    const allClasses = getClasses()
    
    if (currentUser.role === 'teacher') {
      // Учитель видит свои классы
      const teacherClasses = allClasses.filter(c => c.teacherId === currentUser.id)
      setMyClasses(teacherClasses)
      
      // Подсчёт учеников (по всем классам учителя)
      let totalStudents = 0
      for (const classItem of teacherClasses) {
        const students = getClassStudents(classItem.id)
        totalStudents += students.length
      }
      
      setStats({
        classes: teacherClasses.length,
        students: totalStudents,
        assignments: 0
      })
    } else {
      // Ученик видит классы, на которые записан
      const enrollments = getEnrollments()
      const myClassIds = enrollments
        .filter(e => e.userId === currentUser.id || e.studentId === currentUser.id)
        .map(e => e.courseId || e.classroomId)
      
      const enrolledClasses = allClasses.filter(c => myClassIds.includes(c.id))
      setMyClasses(enrolledClasses)
      
      setStats({
        classes: enrolledClasses.length,
        students: 0,
        assignments: 0
      })
    }
  }, [router])

  if (!user) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Добро пожаловать, {user.name}!
        </h1>
        <p className="text-gray-600 mt-1">Вот что происходит в ваших классах сегодня.</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Мои классы</p>
              <p className="text-3xl font-bold text-gray-900">{stats.classes}</p>
            </div>
            <BookOpen className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        
        {user.role === 'teacher' ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Всего учеников</p>
                <p className="text-3xl font-bold text-gray-900">{stats.students}</p>
              </div>
              <Users className="w-10 h-10 text-green-500" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Выполнено работ</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <Award className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Предстоит сдать</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <Calendar className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Мои классы */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Мои классы</h2>
          {user.role === 'teacher' && (
            <Link
              href="/classes/create"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Создать класс
            </Link>
          )}
        </div>
        
        {myClasses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">
              {user.role === 'teacher' 
                ? 'У вас пока нет классов. Создайте свой первый класс!' 
                : 'Вы пока не записаны ни в один класс'}
            </p>
            {user.role === 'teacher' && (
              <Link
                href="/classes/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Создать класс
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClasses.map((classroom) => (
              <Link
                key={classroom.id}
                href={`/classes/${classroom.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                <div className={`h-24 ${classroom.coverColor || 'bg-gradient-to-r from-blue-500 to-purple-600'}`} />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{classroom.name}</h3>
                  <p className="text-sm text-gray-500">{classroom.subject}</p>
                  <p className="text-xs text-gray-400 mt-2">{classroom.section}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}