export interface User {
  id: string | number
  email: string
  name: string
  role: 'teacher' | 'student'
  avatar?: string
  createdAt: string
}

export interface Classroom {
  id: string
  name: string
  section: string
  subject: string
  room?: string
  teacherId: string | number
  teacherName: string
  coverColor: string
  createdAt: string
  inviteCode: string
}

export interface Enrollment {
  id: string
  classroomId?: string
  courseId?: string
  userId?: string | number
  studentId?: string | number
  studentName?: string
  enrolledAt: string
}

export type PostType = 'announcement' | 'material' | 'assignment'

export interface Post {
  id: string
  classroomId: string
  authorId: string | number
  authorName: string
  authorRole: string
  title: string
  content: string
  type: PostType
  attachments?: string[]
  assignmentId?: string  // уже должно быть string | undefined
  createdAt: string
}

export interface Assignment {
  id: string
  postId: string
  classroomId: string
  title: string
  description: string
  dueDate: string
  maxScore: number
  attachments?: string[]
  createdAt: string
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string | number
  studentName: string
  content: string
  attachments?: string[]
  score?: number
  feedback?: string
  submittedAt: string
  gradedAt?: string
}

export interface Comment {
  id: string
  postId: string
  authorId: string | number
  authorName: string
  content: string
  createdAt: string
}