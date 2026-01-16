/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true, // Keep if you use server actions
  },
  serverExternalPackages: ['mongoose'], // replaces serverComponentsExternalPackages
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
  reactStrictMode: true,
}

module.exports = nextConfig
