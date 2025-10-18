/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude canvas from server-side bundling (Konva.js dependency)
  experimental: {
    serverComponentsExternalPackages: ['canvas'],
  },
  webpack: (config, { isServer }) => {
    // Exclude canvas module from server bundle (Konva dependency)
    if (isServer) {
      config.externals.push({
        canvas: 'canvas',
      });
    }
    // Ignore canvas module on client (not needed)
    config.resolve.alias.canvas = false;
    
    return config;
  },
};

export default nextConfig;

