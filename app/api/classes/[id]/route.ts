import { NextRequest, NextResponse } from 'next/server'

let classes: any[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const classData = classes.find(c => c.id === params.id)
  
  if (!classData) {
    return NextResponse.json(
      { error: 'Класс не найден' },
      { status: 404 }
    )
  }
  
  return NextResponse.json(classData)
}