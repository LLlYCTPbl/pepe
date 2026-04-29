import { NextRequest, NextResponse } from 'next/server'

// Временное решение для деплоя
export const runtime = 'nodejs'

let enrollments: any[] = []

export async function GET() {
  return NextResponse.json(enrollments)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  enrollments.push(body)
  return NextResponse.json(body)
}