import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const enrollments = await prisma.enrollment.findMany()
  return NextResponse.json(enrollments)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const enrollment = await prisma.enrollment.create({
    data: {
      classId: body.classroomId,
      studentId: body.studentId,
      studentName: body.studentName,
    }
  })
  return NextResponse.json(enrollment)
}