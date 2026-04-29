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
  
  const existingIndex = global._globalClasses.findIndex(c => c.id === newClass.id)
  
  if (existingIndex === -1) {
    global._globalClasses.push(newClass)
  } else {
    global._globalClasses[existingIndex] = newClass
  }
  
  return NextResponse.json(newClass)
}

export async function PUT(request: NextRequest) {
  const classes = await request.json()
  global._globalClasses = classes
  return NextResponse.json({ success: true })
}