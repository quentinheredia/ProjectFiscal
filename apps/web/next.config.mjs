import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@fiscal-insights/tax-data', '@fiscal-insights/tax-engine'],
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  // Every page lives under a locale; unlocalized requests redirect to /en
  async redirects() {
    return [
      { source: '/', destination: '/en', permanent: false },
      { source: '/calculator/:path*', destination: '/en/calculator/:path*', permanent: false },
      { source: '/salary/:path*', destination: '/en/salary/:path*', permanent: false },
    ];
  },
};

export default nextConfig;
