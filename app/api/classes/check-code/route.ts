import { NextRequest, NextResponse } from 'next/server'

declare global {
  var _globalClasses: any[]
}

if (!global._globalClasses) {
  global._globalClasses = []
}

export async function POST(request: NextRequest) {
  const { inviteCode } = await request.json()
  
  const foundClass = global._globalClasses.find(c => c.inviteCode === inviteCode)
  
  if (foundClass) {
    return NextResponse.json({ success: true, classroom: foundClass })
  } else {
    return NextResponse.json({ success: false, error: 'Код не найден' }, { status: 404 })
  }
}