/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the entire experimental section or keep it empty
  // experimental: {
  //   serverActions: true,  // <-- REMOVE THIS LINE
  // },
  
  serverExternalPackages: ['mongoose'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '/images/**',
      },
    ],
  },
}

module.exports = nextConfig