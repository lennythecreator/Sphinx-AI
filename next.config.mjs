/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'books.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /canvas\.node$/,
      use: 'file-loader',
    });
    return config;
  },
};

export default nextConfig;