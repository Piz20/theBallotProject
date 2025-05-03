import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home.html',  // Redirige vers le fichier home.htm dans le dossier public
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
