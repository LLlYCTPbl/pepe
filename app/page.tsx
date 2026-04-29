import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Google Classroom Clone</h1>
          <p className="text-xl mb-8">Современная платформа для обучения и общения</p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/register"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Начать обучение
            </Link>
            <Link 
              href="/login"
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}