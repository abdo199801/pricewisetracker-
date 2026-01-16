/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental server actions (true is fine)
  experimental: {
    serverActions: true,
  },

  // Move external packages out of experimental
  serverExternalPackages: ['mongoose'],

  // Replace deprecated images.domains with remotePatterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Enable React strict mode
  reactStrictMode: true,

  // Optional: faster builds
  swcMinify: true,
}

module.exports = nextConfig
