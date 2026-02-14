import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages 배포를 위한 설정
  // 저장소 이름이 'physics-quiz'인 경우 basePath 설정
  // 다른 이름으로 저장소를 만들면 이 값을 변경하세요
  basePath: process.env.GITHUB_PAGES ? "/physics-quiz" : "",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
