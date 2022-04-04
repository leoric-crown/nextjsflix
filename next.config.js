/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["i.ytimg.com", "yt3.ggpht.com", "lh3.googleusercontent.com"],
  },
};

module.exports = nextConfig;
