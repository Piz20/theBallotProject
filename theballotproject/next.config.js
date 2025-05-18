/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false ,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  
};

module.exports = nextConfig;
