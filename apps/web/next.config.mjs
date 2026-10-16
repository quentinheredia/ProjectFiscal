/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@fiscal-insights/tax-data', '@fiscal-insights/tax-engine'],
};

export default nextConfig;
