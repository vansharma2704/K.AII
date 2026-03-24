const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'pdf-parse', 'mammoth'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me"
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  outputFileTracingRoot: path.resolve(__dirname),
}

module.exports = nextConfig