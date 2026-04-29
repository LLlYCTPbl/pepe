'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Crown } from 'lucide-react'
import { getCurrentUser, getClassById, getClassStudents, getUsers } from '@/lib/storage'
import type { User as UserType, Classroom } from '@/types'
import * as React from 'react'

export default function PeoplePage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)

    const classData = getClassById(id)
    if (!classData) {
      router.push('/classes')
      return
    }
    setClassroom(classData)

    const studentsList = getClassStudents(id)
    setStudents(studentsList)
  }, [router, id])

  if (!user || !classroom) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  const isTeacher = user.role === 'teacher' && user.id === classroom.teacherId

  return (
    <div>
      <div className="mb-6">
        <Link href={`/classes/${id}`} className="text-blue-600 hover:text-blue-700">
          ← Назад к классу
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Участники класса</h1>

      {/* Учитель */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Преподаватель</h2>
        </div>
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{classroom.teacherName}</span>
              <Crown className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-500">Учитель</p>
          </div>
        </div>
      </div>

      {/* Ученики */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Ученики ({students.length})</h2>
        </div>
        {students.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Пока нет учеников в классе
            {isTeacher && (
              <p className="text-sm mt-2">
                Поделитесь кодом приглашения: <strong>{classroom.inviteCode}</strong>
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {students.map((student) => (
              <div key={student.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{student.name}</div>
                  <p className="text-sm text-gray-500">
                    Присоединился: {new Date(student.enrolledAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Код приглашения для учителя */}
      {isTeacher && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Код приглашения:</strong> {classroom.inviteCode}
            <br />
            <span className="text-xs">
              Поделитесь этим кодом с учениками, чтобы они могли присоединиться к классу
            </span>
          </p>
        </div>
      )}
    </div>
  )
}