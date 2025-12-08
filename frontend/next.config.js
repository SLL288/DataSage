/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',       // <-- this makes static HTML export for Cloudflare!
  distDir: 'out',         // <-- this matches Cloudflare output directory

  images: {
    unoptimized: true,    // <-- required for static Next.js export
  },
};

module.exports = nextConfig;
