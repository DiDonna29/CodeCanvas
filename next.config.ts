
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['lucide-react'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // Mantener otras opciones experimentales si las hubiera
  },
  // @ts-ignore - Algunas versiones de Next.js 15 requieren esto en la raíz para entornos de desarrollo remotos
  allowedDevOrigins: [
    '6000-firebase-studio-1782014317246.cluster-gizzoza7hzhfyxzo5d76y3flkw.cloudworkstations.dev',
    '*.cloudworkstations.dev'
  ],
};

export default nextConfig;
