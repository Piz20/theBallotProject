/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  devIndicators: false ,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  
};

module.exports = nextConfig;
