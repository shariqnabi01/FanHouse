/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.onrender.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  output: 'standalone',
}

module.exports = nextConfig

