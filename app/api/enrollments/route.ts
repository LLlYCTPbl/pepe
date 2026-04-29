import { NextRequest, NextResponse } from 'next/server'

// Общее хранилище на сервере (для всех пользователей)
let globalEnrollments: any[] = []

export async function GET() {
  return NextResponse.json(globalEnrollments)
}

export async function POST(request: NextRequest) {
  const enrollment = await request.json()
  globalEnrollments.push(enrollment)
  console.log('✅ Ученик добавлен:', enrollment.studentName)
  return NextResponse.json(enrollment)
}