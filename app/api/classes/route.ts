import { NextRequest, NextResponse } from 'next/server'

declare global {
  var _globalClasses: any[]
}

if (!global._globalClasses) {
  global._globalClasses = []
}

export async function GET() {
  return NextResponse.json(global._globalClasses)
}

export async function POST(request: NextRequest) {
  const newClass = await request.json()
  global._globalClasses.push(newClass)
  return NextResponse.json(newClass)
}

export async function PUT(request: NextRequest) {
  const classes = await request.json()
  global._globalClasses = classes
  return NextResponse.json({ success: true })
}