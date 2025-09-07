/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['books.google.com'], // Add the domain here
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
