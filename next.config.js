/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cdn.nomstead.com', 'api.nomstead.com', 'nomstead.com']
  },
  eslint: { ignoreDuringBuilds: true }
};

module.exports = nextConfig;
