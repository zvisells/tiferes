/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
    ],
  },
  // Increase body size limit for file uploads (default is 50MB)
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
};

module.exports = nextConfig;

