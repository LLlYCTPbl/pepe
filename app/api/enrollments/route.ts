import { NextRequest, NextResponse } from 'next/server'

declare global {
  var _globalEnrollments: any[]
}

if (!global._globalEnrollments) {
  global._globalEnrollments = []
}

export async function GET() {
  return NextResponse.json(global._globalEnrollments)
}

export async function POST(request: NextRequest) {
  const newEnrollment = await request.json()
  global._globalEnrollments.push(newEnrollment)
  return NextResponse.json(newEnrollment)
}

export async function PUT(request: NextRequest) {
  const enrollments = await request.json()
  global._globalEnrollments = enrollments
  return NextResponse.json({ success: true })
}