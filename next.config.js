/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["konami-images.s3.ap-southeast-2.amazonaws.com"],
  },
};

module.exports = nextConfig;
