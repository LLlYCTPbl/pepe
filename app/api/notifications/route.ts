import { NextRequest, NextResponse } from 'next/server'

declare global {
  var _globalNotifications: any[]
}

if (!global._globalNotifications) {
  global._globalNotifications = []
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const after = searchParams.get('after')
  
  let notifications = global._globalNotifications
  
  // Если указан параметр after, возвращаем только уведомления после указанной даты
  if (after) {
    const afterDate = new Date(after)
    notifications = notifications.filter(n => new Date(n.createdAt) > afterDate)
  }
  
  return NextResponse.json(notifications)
}

export async function POST(request: NextRequest) {
  const notification = await request.json()
  
  // Проверяем дубликаты
  const now = new Date(notification.createdAt).getTime()
  const duplicate = global._globalNotifications.some((n: any) => 
    n.message === notification.message && 
    Math.abs(new Date(n.createdAt).getTime() - now) < 10000
  )
  
  if (!duplicate) {
    global._globalNotifications.push(notification)
    // Ограничиваем количество уведомлений (храним последние 100)
    if (global._globalNotifications.length > 100) {
      global._globalNotifications = global._globalNotifications.slice(-100)
    }
  }
  
  return NextResponse.json(notification)
}

export async function PUT(request: NextRequest) {
  const notifications = await request.json()
  global._globalNotifications = notifications
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  if (id === 'all') {
    global._globalNotifications = []
  } else {
    global._globalNotifications = global._globalNotifications.filter((n: any) => n.id !== id)
  }
  return NextResponse.json({ success: true })
}