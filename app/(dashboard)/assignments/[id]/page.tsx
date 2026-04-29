'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Award, Send, CheckCircle, ArrowLeft } from 'lucide-react'
import { getCurrentUser, getAssignmentById, getClassById, getSubmissionByStudent, saveSubmission, generateId, updateSubmission } from '@/lib/storage'
import type { User, Assignment, Classroom, Submission } from '@/types'
import * as React from 'react'

export default function AssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)

    const assignmentData = getAssignmentById(id)
    if (!assignmentData) {
      router.push('/classes')
      return
    }
    setAssignment(assignmentData)

    const classData = getClassById(assignmentData.classroomId)
    if (classData) {
      setClassroom(classData)
    }

    // Исправлено: преобразуем id в строку, если нужно
    const userId = typeof currentUser.id === 'string' ? currentUser.id : String(currentUser.id)
    const existingSubmission = getSubmissionByStudent(id, userId)
    if (existingSubmission) {
      setSubmission(existingSubmission)
      setAnswer(existingSubmission.content)
    }
  }, [router, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !assignment) return

    setLoading(true)

    const userId = typeof user.id === 'string' ? user.id : String(user.id)

    if (submission) {
      updateSubmission(submission.id, {
        content: answer,
        submittedAt: new Date().toISOString()
      })
      
      const allSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]')
      await fetch('/api/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allSubmissions)
      })
      
      alert('Работа обновлена!')
    } else {
      const newSubmission: Submission = {
        id: generateId(),
        assignmentId: assignment.id,
        studentId: userId,
        studentName: user.name,
        content: answer,
        submittedAt: new Date().toISOString()
      }
      saveSubmission(newSubmission)
      
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubmission)
      })
      
      setSubmission(newSubmission)
      alert('Работа сдана!')
    }

    setLoading(false)
    router.push(`/classes/${assignment.classroomId}`)
  }

  if (!user || !assignment || !classroom) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  const isOverdue = new Date(assignment.dueDate) < new Date()
  const isSubmitted = !!submission

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/classes/${classroom.id}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4" />
          Назад к классу
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Дедлайн: {new Date(assignment.dueDate).toLocaleDateString('ru-RU')}
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              Макс. балл: {assignment.maxScore}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Описание задания</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          {isSubmitted ? 'Редактировать работу' : 'Сдать работу'}
        </h2>
        
        {isOverdue && !isSubmitted ? (
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            ⚠️ Дедлайн прошёл. Вы не можете сдать работу.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ваш ответ
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Напишите ваш ответ здесь..."
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Отправка...' : (isSubmitted ? 'Обновить работу' : 'Сдать работу')}
            </button>
            
            {isSubmitted && (
              <p className="text-sm text-green-600 mt-3 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Работа была сдана {new Date(submission.submittedAt).toLocaleDateString('ru-RU')}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}