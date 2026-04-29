import { NextRequest, NextResponse } from 'next/server'

// Временное хранилище в памяти (для Vercel)
let enrollments: any[] = []

export async function GET() {
  return NextResponse.json(enrollments)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  enrollments.push(body)
  console.log('✅ Добавлен ученик:', body.studentName)
  return NextResponse.json(body)
}