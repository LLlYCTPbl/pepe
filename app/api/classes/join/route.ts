import { NextRequest, NextResponse } from 'next/server'

declare global {
  var _classes: any[]
  var _enrollments: any[]
}

export async function POST(request: NextRequest) {
  const { inviteCode, studentId, studentName } = await request.json()
  
  console.log('Поиск класса с кодом:', inviteCode)
  console.log('Все классы:', global._classes)
  
  const classToJoin = global._classes.find(c => c.inviteCode === inviteCode)
  
  if (!classToJoin) {
    return NextResponse.json(
      { error: 'Неверный код приглашения' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({ success: true, classroom: classToJoin })
}