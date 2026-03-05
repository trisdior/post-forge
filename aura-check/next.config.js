/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  allowedDevOrigins: ['*'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
