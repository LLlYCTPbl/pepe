import { NextRequest, NextResponse } from 'next/server'

declare global {
  var _globalSubmissions: any[]
}

if (!global._globalSubmissions) {
  global._globalSubmissions = []
}

export async function GET() {
  return NextResponse.json(global._globalSubmissions)
}

export async function POST(request: NextRequest) {
  const newSubmission = await request.json()
  
  const exists = global._globalSubmissions.some(s => s.id === newSubmission.id)
  
  if (!exists) {
    global._globalSubmissions.push(newSubmission)
    console.log('✅ Submission добавлена на сервер:', newSubmission.id)
  } else {
    console.log('⚠️ Submission уже существует:', newSubmission.id)
  }
  
  return NextResponse.json(newSubmission)
}

export async function PUT(request: NextRequest) {
  const submissions = await request.json()
  global._globalSubmissions = submissions
  console.log('📦 Submissions синхронизированы:', submissions.length)
  return NextResponse.json({ success: true })
}