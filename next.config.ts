import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = nextConfig

export default nextConfig;

