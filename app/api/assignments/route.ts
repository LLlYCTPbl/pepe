import { NextRequest, NextResponse } from 'next/server'

declare global {
  var _globalAssignments: any[]
}

if (!global._globalAssignments) {
  global._globalAssignments = []
}

export async function GET() {
  return NextResponse.json(global._globalAssignments)
}

export async function POST(request: NextRequest) {
  const newAssignment = await request.json()
  global._globalAssignments.push(newAssignment)
  return NextResponse.json(newAssignment)
}

export async function PUT(request: NextRequest) {
  const assignments = await request.json()
  global._globalAssignments = assignments
  return NextResponse.json({ success: true })
}