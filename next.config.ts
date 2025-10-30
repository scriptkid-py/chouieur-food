import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable SWC minification in production only
  swcMinify: process.env.NODE_ENV === 'production',
  images: {
    unoptimized: true, // Disable Image Optimization for Vercel compatibility
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
      {
        protocol: 'https',
        hostname: '**.vercel.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'chouieur-express-backend-h74v.onrender.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Production optimizations for Render deployment
  // Remove standalone output for Render compatibility
  // output: 'standalone',
  
  // Ensure proper build output
  distDir: '.next',
  
  // Optimize for production
  compress: true,
  
  // Handle environment variables properly
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
