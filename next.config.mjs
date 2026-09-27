/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "paycard.co",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async rewrites() {
    return [
      {
        source: "/produit/:slug*",
        destination: "/products/:slug*",
      },
      {
        source: "/catalogue",
        destination: "/motos",
      },
      {
        source: "/dashboard/client/commandes/:orderNumber*",
        destination: "/compte/commandes/:orderNumber*",
      },
    ];
  },
};

export default nextConfig;
