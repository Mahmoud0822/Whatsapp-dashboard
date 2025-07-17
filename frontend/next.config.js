/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'api.whatsapp.com', 'web.whatsapp.com'],
  },
//  experimental: {
//    serverActions: true,
//  },
};

module.exports = nextConfig;