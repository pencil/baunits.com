/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    loader: "custom",
    loaderFile: "./img-loader.ts",
  },
  trailingSlash: true,
};

export default nextConfig;
