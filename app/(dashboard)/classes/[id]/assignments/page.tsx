'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getClassById, getAssignmentsByClass } from '@/lib/storage'
import type { User, Classroom, Assignment } from '@/types'
import * as React from 'react'

export default function ClassAssignmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])

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

    const classData = getClassById(id)
    if (!classData) {
      router.push('/classes')
      return
    }
    setClassroom(classData)

    const classAssignments = getAssignmentsByClass(id)
    setAssignments(classAssignments.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()))
  }, [router, id])

  if (!user || !classroom) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/classes/${id}`} className="text-blue-600 hover:text-blue-700">
          ← Назад к классу
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Все задания</h1>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          Пока нет созданных заданий
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Link
              key={assignment.id}
              href={`/classes/${id}/assignments/${assignment.id}/submissions`}
              className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Дедлайн: {new Date(assignment.dueDate).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div className="text-sm text-blue-600">
                  Посмотреть работы →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}