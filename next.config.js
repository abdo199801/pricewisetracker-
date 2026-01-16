/** @type {import('next').NextConfig} */
const nextConfig = {
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
  serverExternalPackages: ['mongoose'],
  reactStrictMode: true,
  
  // Add these optimizations
  swcMinify: true, // Use SWC minifier (faster than Terser)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console.log in production
  },
}

module.exports = nextConfig