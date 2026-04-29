import { NextRequest, NextResponse } from 'next/server'

let globalAssignments: any[] = []

export async function GET() {
  return NextResponse.json(globalAssignments)
}

export async function POST(request: NextRequest) {
  const assignment = await request.json()
  globalAssignments.push(assignment)
  return NextResponse.json(assignment)
}