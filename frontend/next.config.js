/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.onrender.com',
      },
    ],
  },
  output: 'standalone',
}

module.exports = nextConfig

