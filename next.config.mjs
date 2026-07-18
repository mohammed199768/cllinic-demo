/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  allowedDevOrigins: ['127.0.0.1'],
  transpilePackages: ['@ourclinic/contracts', '@ourclinic/local-data'],
  async headers() {
    const developmentHeaders = process.env.NODE_ENV !== 'production'
      ? [{ source: '/:path*', headers: [{ key: 'X-OurClinic-Runtime', value: 'development' }] }]
      : [];
    return [
      ...developmentHeaders,
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }, { key: 'Service-Worker-Allowed', value: '/' }] },
      { source: '/manifest.webmanifest', headers: [{ key: 'Content-Type', value: 'application/manifest+json' }] },
    ];
  },
  async rewrites() {
    return [{ source: '/favicon.ico', destination: '/icon.svg' }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
