/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose'],
  
  images: {
    remotePatterns: [
      // Amazon domains
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.com', // Wildcard for all Amazon subdomains
      },
      
      // Placeholder domain
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      
      // eBay domains
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com.au',
      },
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com.uk',
      },
      {
        protocol: 'https',
        hostname: '**.ebayimg.com', // Wildcard for all eBay image subdomains
      },
      {
        protocol: 'https',
        hostname: 'thumbs2.ebaystatic.com',
      },
      {
        protocol: 'https',
        hostname: 'ir.ebaystatic.com',
      },
    ],
  },
  
  reactStrictMode: true,
}

module.exports = nextConfig