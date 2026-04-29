import type { Classroom, User } from '@/types'

const API_URL = '/api'

// Классы
export async function fetchClasses(userId: string, role: string): Promise<Classroom[]> {
  const res = await fetch(`${API_URL}/classes?userId=${userId}&role=${role}`)
  return res.json()
}

export async function createClass(classData: Omit<Classroom, 'id' | 'inviteCode' | 'createdAt'>): Promise<Classroom> {
  const res = await fetch(`${API_URL}/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(classData)
  })
  return res.json()
}

export async function joinClassByCode(inviteCode: string, studentId: string, studentName: string): Promise<any> {
  const res = await fetch(`${API_URL}/classes/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviteCode, studentId, studentName })
  })
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error)
  }
  
  return res.json()
}

export async function getClassById(id: string): Promise<Classroom | null> {
  const res = await fetch(`${API_URL}/classes/${id}`)
  if (!res.ok) return null
  return res.json()
}