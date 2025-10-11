/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.nomstead.com', 'nomstead.com'],
  },
};

module.exports = nextConfig;
