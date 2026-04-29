import { NextRequest, NextResponse } from 'next/server'

declare global {
  var _globalComments: any[]
}

if (!global._globalComments) {
  global._globalComments = []
}

export async function GET() {
  return NextResponse.json(global._globalComments)
}

export async function POST(request: NextRequest) {
  const newComment = await request.json()
  global._globalComments.push(newComment)
  return NextResponse.json(newComment)
}

export async function PUT(request: NextRequest) {
  const comments = await request.json()
  global._globalComments = comments
  return NextResponse.json({ success: true })
}