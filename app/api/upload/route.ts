import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const id = formData.get('id') as string

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const originalName = file.name
    const extension = path.extname(originalName)
    const safeName = originalName.replace(/[^a-zA-Zа-яА-Я0-9.-]/g, '_')
    const fileName = `${Date.now()}-${safeName}`
    
    let uploadDir = ''
    if (type === 'submission') {
      uploadDir = path.join(process.cwd(), 'public', 'uploads', 'submissions', id)
    } else {
      uploadDir = path.join(process.cwd(), 'public', 'uploads', 'materials', id)
    }
    
    await mkdir(uploadDir, { recursive: true })
    
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)
    
    const fileUrl = `/uploads/${type}/${id}/${fileName}`
    
    console.log('Файл сохранен:', filePath)
    console.log('URL:', fileUrl)
    
    return NextResponse.json({ 
      success: true, 
      fileUrl,
      fileName: originalName,
      size: file.size
    })
  } catch (error) {
    console.error('Ошибка загрузки файла:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}