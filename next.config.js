/** @type {import('next').NextConfig} */
const nextConfig = {
  // Разрешаем загрузку файлов
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Content-Disposition', value: 'attachment' },
        ],
      },
    ]
  },
  // Настройки для деплоя
  images: {
    unoptimized: true,
  },
  output: 'standalone',
}

module.exports = nextConfig