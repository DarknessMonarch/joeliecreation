/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'minio.swiftsyn.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
