import { NextRequest, NextResponse } from 'next/server'

declare global {
  var _globalPosts: any[]
}

if (!global._globalPosts) {
  global._globalPosts = []
}

export async function GET() {
  return NextResponse.json(global._globalPosts)
}

export async function POST(request: NextRequest) {
  const newPost = await request.json()
  global._globalPosts.push(newPost)
  return NextResponse.json(newPost)
}

export async function PUT(request: NextRequest) {
  const posts = await request.json()
  global._globalPosts = posts
  return NextResponse.json({ success: true })
}