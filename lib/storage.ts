import { User, Classroom, Enrollment, Post, Assignment, Submission, Comment } from '@/types'

export const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('users')
  return data ? JSON.parse(data) : []
}

export const saveUser = (user: User) => {
  const users = getUsers()
  users.push(user)
  localStorage.setItem('users', JSON.stringify(users))
}

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem('currentUser')
  return data ? JSON.parse(data) : null
}

export const setCurrentUser = (user: User | null) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('currentUser', JSON.stringify(user))
}

export const getClasses = (): Classroom[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('classes')
  return data ? JSON.parse(data) : []
}

export const saveClass = (classroom: Classroom) => {
  const classes = getClasses()
  classes.push(classroom)
  localStorage.setItem('classes', JSON.stringify(classes))
}

export const getClassById = (id: string): Classroom | undefined => {
  return getClasses().find(c => c.id === id)
}

export const getEnrollments = (): Enrollment[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('enrollments')
  return data ? JSON.parse(data) : []
}

export const addEnrollment = (enrollment: Enrollment) => {
  const enrollments = getEnrollments()
  enrollments.push(enrollment)
  localStorage.setItem('enrollments', JSON.stringify(enrollments))
}

export const getClassStudents = (classroomId: string): any[] => {
  if (typeof window === 'undefined') return []
  
  const enrollments = getEnrollments()
  const users = getUsers()
  
  const classEnrollments = enrollments.filter(e => e.courseId === classroomId || e.classroomId === classroomId)
  
  return classEnrollments.map(enrollment => {
    const userId = enrollment.userId || enrollment.studentId
    const user = users.find(u => u.id == userId)
    return {
      id: enrollment.id,
      name: user?.name || 'Ученик',
      enrolledAt: enrollment.enrolledAt,
      role: user?.role || 'student'  // Добавляем роль
    }
  }).filter(student => student.role !== 'teacher') // Исключаем учителя
}

export const getPosts = (): Post[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('posts')
  return data ? JSON.parse(data) : []
}

export const savePost = (post: Post) => {
  const posts = getPosts()
  posts.push(post)
  localStorage.setItem('posts', JSON.stringify(posts))
}

export const getPostsByClass = (classroomId: string): Post[] => {
  return getPosts().filter(p => p.classroomId === classroomId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const getAssignments = (): Assignment[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('assignments')
  return data ? JSON.parse(data) : []
}

export const saveAssignment = (assignment: Assignment) => {
  const assignments = getAssignments()
  assignments.push(assignment)
  localStorage.setItem('assignments', JSON.stringify(assignments))
}

export const getAssignmentsByClass = (classroomId: string): Assignment[] => {
  return getAssignments().filter(a => a.classroomId === classroomId)
}

export const getAssignmentById = (id: string): Assignment | undefined => {
  return getAssignments().find(a => a.id === id)
}

export const getSubmissions = (): Submission[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('submissions')
  return data ? JSON.parse(data) : []
}

export const saveSubmission = (submission: Submission) => {
  const submissions = getSubmissions()
  submissions.push(submission)
  localStorage.setItem('submissions', JSON.stringify(submissions))
}

export const getSubmissionsByAssignment = (assignmentId: string): Submission[] => {
  return getSubmissions().filter(s => s.assignmentId === assignmentId)
}

export const getSubmissionByStudent = (assignmentId: string, studentId: string): Submission | undefined => {
  return getSubmissions().find(s => s.assignmentId === assignmentId && s.studentId === studentId)
}

export const updateSubmission = (id: string, updates: Partial<Submission>) => {
  const submissions = getSubmissions()
  const index = submissions.findIndex(s => s.id === id)
  if (index !== -1) {
    submissions[index] = { ...submissions[index], ...updates }
    localStorage.setItem('submissions', JSON.stringify(submissions))
  }
}

export const getComments = (): Comment[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('comments')
  return data ? JSON.parse(data) : []
}

export const saveComment = (comment: Comment) => {
  const comments = getComments()
  comments.push(comment)
  localStorage.setItem('comments', JSON.stringify(comments))
}

export const getCommentsByPost = (postId: string): Comment[] => {
  return getComments().filter(c => c.postId === postId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export const updateUser = (id: string, updates: Partial<User>) => {
  const users = getUsers()
  const index = users.findIndex(u => u.id == id)
  if (index !== -1) {
    users[index] = { ...users[index], ...updates }
    localStorage.setItem('users', JSON.stringify(users))
  }
}