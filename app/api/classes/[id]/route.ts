import { NextRequest, NextResponse } from 'next/server'

declare global {
  var _globalClasses: any[]
}

if (!global._globalClasses) {
  global._globalClasses = []
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const classData = global._globalClasses.find(c => c.id === id)
  
  if (!classData) {
    return NextResponse.json(
      { error: 'Класс не найден' },
      { status: 404 }
    )
  }
  
  return NextResponse.json(classData)
}