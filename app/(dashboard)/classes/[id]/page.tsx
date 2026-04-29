'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, Send, MessageCircle, Clock, Award, Eye, RefreshCw, FileText, Download } from 'lucide-react'
import { getCurrentUser, getClassById, getSubmissions, getClassStudents, getEnrollments } from '@/lib/storage'
import type { User, Classroom, Post, Comment, Assignment, Submission, PostType } from '@/types'
import * as React from 'react'

export default function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [showPostForm, setShowPostForm] = useState(false)
  const [newPost, setNewPost] = useState<{
    title: string
    content: string
    type: PostType
    dueDate: string
    maxScore: number
  }>({ 
    title: '', 
    content: '', 
    type: 'announcement',
    dueDate: '',
    maxScore: 100
  })
  const [showComments, setShowComments] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'feed' | 'people' | 'assignments'>('feed')
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<Submission[]>([])

  const loadData = async () => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)

    let classData = getClassById(id)
    if (!classData) {
      router.push('/classes')
      return
    }
    setClassroom(classData)

    try {
      const enrollmentsRes = await fetch('/api/enrollments')
      const serverEnrollments = await enrollmentsRes.json()
      if (serverEnrollments.length > 0) {
        localStorage.setItem('enrollments', JSON.stringify(serverEnrollments))
      }
    } catch (error) {}

    try {
      const submissionsRes = await fetch('/api/submissions')
      const serverSubmissions = await submissionsRes.json()
      if (serverSubmissions.length > 0) {
        localStorage.setItem('submissions', JSON.stringify(serverSubmissions))
        setSubmissions(serverSubmissions)
      } else {
        const localSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]')
        setSubmissions(localSubmissions)
      }
    } catch (error) {}

    try {
      const postsRes = await fetch('/api/posts')
      const serverPosts = await postsRes.json()
      if (serverPosts.length > 0) {
        localStorage.setItem('posts', JSON.stringify(serverPosts))
      }
      
      const assignmentsRes = await fetch('/api/assignments')
      const serverAssignments = await assignmentsRes.json()
      if (serverAssignments.length > 0) {
        localStorage.setItem('assignments', JSON.stringify(serverAssignments))
      }
      
      const commentsRes = await fetch('/api/comments')
      const serverComments = await commentsRes.json()
      if (serverComments.length > 0) {
        localStorage.setItem('comments', JSON.stringify(serverComments))
      }
    } catch (error) {}

    const allPosts = JSON.parse(localStorage.getItem('posts') || '[]')
    const classPosts = allPosts.filter((p: Post) => p.classroomId === id).sort((a: Post, b: Post) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setPosts(classPosts)
    
    const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
    const classAssignments = allAssignments.filter((a: Assignment) => a.classroomId === id)
    setAssignments(classAssignments)
    
    const allComments = JSON.parse(localStorage.getItem('comments') || '[]')
    setComments(allComments)
    
    const studentsList = getClassStudents(id)
    setStudents(studentsList)
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !classroom) return

    setLoading(true)
    
    const postId = Date.now().toString()
    let assignmentId: string | undefined = undefined
    
    if (newPost.type === 'assignment') {
      assignmentId = Date.now().toString() + 'asgn'
      const newAssignment: Assignment = {
        id: assignmentId,
        postId: postId,
        classroomId: classroom.id,
        title: newPost.title,
        description: newPost.content,
        dueDate: newPost.dueDate,
        maxScore: newPost.maxScore,
        createdAt: new Date().toISOString()
      }
      const existingAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
      existingAssignments.push(newAssignment)
      localStorage.setItem('assignments', JSON.stringify(existingAssignments))
      
      await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssignment)
      })
      
      setAssignments([...assignments, newAssignment])
      
      // Отправляем уведомления ученикам
      const studentsList = getClassStudents(classroom.id)
      const sentStudents = new Set()
      
      for (const student of studentsList) {
        if (student.role === 'teacher') continue
        if (sentStudents.has(student.id)) continue
        
        sentStudents.add(student.id)
        
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: Date.now().toString() + student.id + Math.random().toString(36).substr(2, 6),
            type: 'new_assignment',
            title: '📝 Новое задание!',
            message: `${user.name} добавил(а) задание: ${newPost.title.substring(0, 50)}`,
            link: `/classes/${classroom.id}`,
            read: false,
            createdAt: new Date().toISOString()
          })
        })
      }
    }
    
const newPostData: Post = {
  id: postId,
  classroomId: classroom.id,
  authorId: user.id,
  authorName: user.name,
  authorRole: user.role,
  title: newPost.title,
  content: newPost.content,
  type: newPost.type,
  assignmentId: assignmentId || undefined,  // Исправлено: null превращаем в undefined
  createdAt: new Date().toISOString()
}

    const existingPosts = JSON.parse(localStorage.getItem('posts') || '[]')
    existingPosts.push(newPostData)
    localStorage.setItem('posts', JSON.stringify(existingPosts))
    
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPostData)
    })

    setPosts([newPostData, ...posts])
    setNewPost({ title: '', content: '', type: 'announcement', dueDate: '', maxScore: 100 })
    setShowPostForm(false)
    setLoading(false)
    
    alert('Пост опубликован!')
  }

  const handleAddComment = async (postId: string) => {
    if (!user || !newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      postId: postId,
      authorId: user.id,
      authorName: user.name,
      content: newComment,
      createdAt: new Date().toISOString()
    }

    const existingComments = JSON.parse(localStorage.getItem('comments') || '[]')
    existingComments.push(comment)
    localStorage.setItem('comments', JSON.stringify(existingComments))
    
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    })
    
    setComments([...comments, comment])
    setNewComment('')
  }

  const getCommentsForPost = (postId: string): Comment[] => {
    return comments.filter(c => c.postId === postId)
  }

  const getAssignmentForPost = (postId: string): Assignment | undefined => {
    return assignments.find(a => a.postId === postId)
  }

  const getSubmissionForStudent = (assignmentId: string, studentId: string): Submission | undefined => {
    return submissions.find(s => s.assignmentId === assignmentId && (s.studentId === studentId || s.studentId == studentId))
  }

  const getSubmissionsForAssignment = (assignmentId: string): Submission[] => {
    return submissions.filter(s => s.assignmentId === assignmentId)
  }

  if (!user || !classroom) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  const isTeacher = user.role === 'teacher' && user.id === classroom.teacherId
  const enrollments = getEnrollments()
  const isEnrolled = enrollments.some(e => (e.courseId === classroom.id || e.classroomId === classroom.id) && (e.userId === user.id || e.studentId === user.id))

  const renderPeopleTab = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Преподаватель</h2>
      </div>
      <div className="p-4 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-bold">👨‍🏫</span>
        </div>
        <div>
          <div className="font-medium text-gray-900">{classroom.teacherName}</div>
          <div className="text-sm text-gray-500">Учитель</div>
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Ученики ({students.length})</h2>
      </div>
      {students.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Пока нет учеников в классе
          {isTeacher && (
            <p className="text-sm mt-2">
              Поделитесь кодом приглашения: <strong className="text-blue-600">{classroom.inviteCode}</strong>
            </p>
          )}
        </div>
      ) : (
        students.map((student) => (
          <div key={student.id} className="p-4 flex items-center gap-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">👨‍🎓</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{student.name}</div>
              <div className="text-sm text-gray-500">
                Присоединился: {new Date(student.enrolledAt).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )

  const renderAssignmentsTab = () => (
    <div className="space-y-4">
      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          Пока нет созданных заданий
        </div>
      ) : (
        assignments.map((assignment) => {
          const subs = getSubmissionsForAssignment(assignment.id)
          const submittedCount = subs.length
          return (
            <div key={assignment.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      📅 Дедлайн: {new Date(assignment.dueDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-blue-600 whitespace-nowrap">
                      📊 Сдано: {submittedCount}/{students.length}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment)
                        setAssignmentSubmissions(subs)
                      }}
                      className="mt-2 flex items-center gap-1 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      <Eye className="w-4 h-4" />
                      Посмотреть работы
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )

  const renderSubmissionsModal = () => {
    if (!selectedAssignment) return null
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">{selectedAssignment.title}</h2>
            <button
              onClick={() => { setSelectedAssignment(null); setAssignmentSubmissions([]) }}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 mb-4">Сданные работы ({assignmentSubmissions.length}/{students.length})</p>
          
          {assignmentSubmissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Пока никто не сдал работу</p>
          ) : (
            <div className="space-y-4">
              {assignmentSubmissions.map((sub) => (
                <div key={sub.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{sub.studentName}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        📅 Сдано: {new Date(sub.submittedAt).toLocaleString()}
                      </div>
                      <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{sub.content}</p>
                      </div>
                      
                      {/* Отображение прикрепленных файлов */}
                      {sub.attachments && sub.attachments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">📎 Прикрепленные файлы:</p>
                          <div className="flex flex-wrap gap-2">
                            {sub.attachments.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                              >
                                <FileText className="w-3 h-3" />
                                Файл {idx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {sub.feedback && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                          <p className="text-sm font-medium text-blue-800">💬 Комментарий учителя:</p>
                          <p className="text-sm text-blue-700 mt-1">{sub.feedback}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4 min-w-[120px]">
                      {sub.score !== undefined ? (
                        <div className="mb-2">
                          <div className="text-lg font-bold text-green-600">
                            {sub.score}/{selectedAssignment.maxScore}
                          </div>
                          <button
                            onClick={() => {
                              const newScore = prompt(`Изменить оценку (0-${selectedAssignment.maxScore})`, sub.score.toString())
                              if (newScore !== null) {
                                const scoreNum = parseInt(newScore)
                                if (!isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= selectedAssignment.maxScore) {
                                  const feedback = prompt('Комментарий к работе (необязательно):', sub.feedback || '')
                                  
                                  const updatedSubmissions = submissions.map(s => 
                                    s.id === sub.id ? { 
                                      ...s, 
                                      score: scoreNum, 
                                      feedback: feedback || undefined,
                                      gradedAt: new Date().toISOString() 
                                    } : s
                                  )
                                  localStorage.setItem('submissions', JSON.stringify(updatedSubmissions))
                                  setSubmissions(updatedSubmissions)
                                  setAssignmentSubmissions(updatedSubmissions.filter(s => s.assignmentId === selectedAssignment.id))
                                  
                                  fetch('/api/submissions', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(updatedSubmissions)
                                  })
                                  
                                  fetch('/api/notifications', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      id: Date.now().toString(),
                                      type: 'grade',
                                      title: '📊 Оценка изменена!',
                                      message: `Ваша работа "${selectedAssignment.title}" изменена на ${scoreNum} баллов`,
                                      link: `/classes/${classroom?.id}`,
                                      read: false,
                                      createdAt: new Date().toISOString()
                                    })
                                  })
                                  
                                  alert(`Оценка изменена на ${scoreNum}!`)
                                } else {
                                  alert(`Оценка должна быть от 0 до ${selectedAssignment.maxScore}`)
                                }
                              }
                            }}
                            className="w-full px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition mb-1"
                          >
                            ✏️ Изменить оценку
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const score = prompt('Введите оценку (0-' + selectedAssignment.maxScore + ')', '0')
                            if (score !== null) {
                              const newScore = parseInt(score)
                              if (!isNaN(newScore) && newScore >= 0 && newScore <= selectedAssignment.maxScore) {
                                const feedback = prompt('Комментарий к работе (необязательно):', '')
                                
                                const updatedSubmissions = submissions.map(s => 
                                  s.id === sub.id ? { 
                                    ...s, 
                                    score: newScore, 
                                    feedback: feedback || undefined,
                                    gradedAt: new Date().toISOString() 
                                  } : s
                                )
                                localStorage.setItem('submissions', JSON.stringify(updatedSubmissions))
                                setSubmissions(updatedSubmissions)
                                setAssignmentSubmissions(updatedSubmissions.filter(s => s.assignmentId === selectedAssignment.id))
                                
                                fetch('/api/submissions', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(updatedSubmissions)
                                })
                                
                                fetch('/api/notifications', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    id: Date.now().toString(),
                                    type: 'grade',
                                    title: '🎯 Работа проверена!',
                                    message: `Ваша работа "${selectedAssignment.title}" оценена на ${newScore} баллов`,
                                    link: `/classes/${classroom?.id}`,
                                    read: false,
                                    createdAt: new Date().toISOString()
                                  })
                                })
                                
                                alert('Оценка сохранена!')
                              } else {
                                alert(`Оценка должна быть от 0 до ${selectedAssignment.maxScore}`)
                              }
                            }
                          }}
                          className="w-full px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                        >
                          📝 Оценить
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={() => { setSelectedAssignment(null); setAssignmentSubmissions([]) }}
            className="mt-6 w-full py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className={`${classroom.coverColor || 'bg-gradient-to-r from-blue-500 to-purple-600'} rounded-lg p-6 text-white mb-6`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{classroom.name}</h1>
            <p className="text-white/90">{classroom.subject}</p>
            <div className="flex gap-4 mt-4 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {classroom.section}
              </span>
              {classroom.room && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Каб. {classroom.room}
                </span>
              )}
            </div>
          </div>
          
          {!isTeacher && (
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Обновить
            </button>
          )}
        </div>
        
        {isTeacher && classroom.inviteCode && (
          <div className="mt-4 inline-block bg-blue-900/50 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm text-white/80">🔑 Код приглашения:</p>
            <p className="text-2xl font-bold tracking-wider">{classroom.inviteCode}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(classroom.inviteCode)
                alert('Код скопирован!')
              }}
              className="mt-1 text-xs bg-white/20 text-white px-2 py-1 rounded hover:bg-white/30"
            >
              Скопировать код
            </button>
          </div>
        )}
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-1 py-2 font-medium text-sm ${activeTab === 'feed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            📰 Лента
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`px-1 py-2 font-medium text-sm ${activeTab === 'people' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            👥 Участники
          </button>
          {isTeacher && (
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-1 py-2 font-medium text-sm ${activeTab === 'assignments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              📋 Задания
            </button>
          )}
        </div>
      </div>

      {activeTab === 'feed' && (
        <>
          {isTeacher && !showPostForm && (
            <button
              onClick={() => setShowPostForm(true)}
              className="w-full mb-6 p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 transition"
            >
              + Что нового в классе?
            </button>
          )}

          {isTeacher && showPostForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <form onSubmit={handleCreatePost}>
                <div className="mb-4">
                  <select
                    value={newPost.type}
                    onChange={(e) => setNewPost({ ...newPost, type: e.target.value as PostType })}
                    className="mb-3 px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-900 bg-white"
                  >
                    <option value="announcement">📢 Объявление</option>
                    <option value="material">📚 Материал</option>
                    <option value="assignment">📝 Задание</option>
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Заголовок"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 text-gray-900 bg-white placeholder-gray-400"
                  />
                  
                  <textarea
                    placeholder="Подробности..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 text-gray-900 bg-white placeholder-gray-400"
                  />
                  
                  {newPost.type === 'assignment' && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Дедлайн</label>
                        <input
                          type="datetime-local"
                          value={newPost.dueDate}
                          onChange={(e) => setNewPost({ ...newPost, dueDate: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Максимальный балл</label>
                        <input
                          type="number"
                          value={newPost.maxScore}
                          onChange={(e) => setNewPost({ ...newPost, maxScore: parseInt(e.target.value) })}
                          required
                          min={1}
                          max={100}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Публикация...' : 'Опубликовать'}
                  </button>
                  <button type="button" onClick={() => setShowPostForm(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                {isTeacher ? 'Создайте первый пост' : 'Пока нет ни одного поста'}
              </div>
            ) : (
              posts.map((post) => {
                const postComments = getCommentsForPost(post.id)
                const showCommentsForThis = showComments === post.id
                const assignment = getAssignmentForPost(post.id)
                const submission = assignment ? getSubmissionForStudent(assignment.id, user.id) : null
                
                return (
                  <div key={post.id} className="bg-white rounded-lg shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {post.type === 'announcement' && <span>📢</span>}
                            {post.type === 'material' && <span>📚</span>}
                            {post.type === 'assignment' && <span>📝</span>}
                            <h3 className="font-semibold text-gray-900">{post.title}</h3>
                          </div>
                          <div className="text-sm text-gray-500">
                            {post.authorName} • {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
                      
                      {post.type === 'assignment' && assignment && (
                        <div className="bg-yellow-50 p-3 rounded-md mb-4">
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-yellow-700" />
                              <span className="text-sm text-yellow-800">
                                📅 Дедлайн: {new Date(assignment.dueDate).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-yellow-700" />
                              <span className="text-sm text-yellow-800">🎯 Макс. балл: {assignment.maxScore}</span>
                            </div>
                          </div>
                          {!isTeacher && submission && (
                            <div className="mt-2 pt-2 border-t border-yellow-200">
                              {submission.score !== undefined ? (
                                <div className="text-sm text-green-700 font-medium">
                                  ✅ Ваша оценка: {submission.score}/{assignment.maxScore}
                                  {submission.feedback && (
                                    <div className="mt-1 text-xs text-green-600 font-normal">
                                      💬 Комментарий: {submission.feedback}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm text-blue-600">
                                  📤 Работа сдана, ожидает проверки
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex gap-4 pt-3 border-t">
                        <button
                          onClick={() => setShowComments(showCommentsForThis ? null : post.id)}
                          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {postComments.length} комментариев
                        </button>
                        {post.type === 'assignment' && !isTeacher && isEnrolled && post.assignmentId && (
                          <Link
                            href={`/assignments/${post.assignmentId}`}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            {submission ? '📝 Посмотреть работу' : '📤 Сдать работу'}
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {showCommentsForThis && (
                      <div className="bg-gray-50 p-6 rounded-b-lg border-t">
                        {postComments.map((comment) => (
                          <div key={comment.id} className="mb-4 last:mb-0">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm text-gray-900">{comment.authorName}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="mt-4 flex gap-2">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Написать комментарий..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!newComment.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {activeTab === 'people' && renderPeopleTab()}
      {activeTab === 'assignments' && renderAssignmentsTab()}
      {renderSubmissionsModal()}
    </div>
  )
}