import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // スマホなど同一Wi-Fi内の別端末からLAN IP経由でdev serverにアクセスして
  // 動作確認する際に、HMR(ホットリロード)のcross-originブロックを回避する。
  allowedDevOrigins: ["192.168.1.7"],
};

export default nextConfig;
