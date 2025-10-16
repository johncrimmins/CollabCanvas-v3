/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Exclude canvas module from server bundle (Konva dependency)
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        { canvas: 'commonjs canvas' },
      ];
    }
    // Also ignore canvas warnings on client
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;

