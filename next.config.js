/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.nomstead.com', pathname: '/**' },
      { protocol: 'https', hostname: '**', pathname: '/**' }
    ]
  },
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig
