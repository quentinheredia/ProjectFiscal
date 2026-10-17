/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@fiscal-insights/tax-data', '@fiscal-insights/tax-engine'],
  // Every page lives under a locale; the root has no layout of its own.
  async redirects() {
    return [{ source: '/', destination: '/en', permanent: false }];
  },
};

export default nextConfig;
