import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "@apps-in-toss/web-framework/config";

// .env.local에서 DEV_HOST 키만 추출 (dotenv 의존성 추가 회피).
// shell 환경변수 우선, 그 다음 .env.local, 그 다음 localhost 폴백.
function getDevHost(): string {
  if (process.env.DEV_HOST) return process.env.DEV_HOST;
  try {
    const text = readFileSync(resolve(".env.local"), "utf-8");
    const match = text.match(/^DEV_HOST=(.+)$/m);
    if (match) return match[1].trim();
  } catch {
    // .env.local 미존재 → 폴백
  }
  return "localhost";
}

export default defineConfig({
  appName: "julook",
  brand: {
    displayName: "주룩",
    primaryColor: "#FFC805", // iOS DesignSystem primary
    icon: "/julook-icon.png", // public/julook-icon.png — 콘솔 등록 시 절대 URL로 교체 필요
  },
  web: {
    // 토스 샌드박스 앱이 RN 번들 안에 박힌 이 host로 Vite에 접근.
    // localhost로 두면 폰 입장의 localhost = 폰 자신이라 -1004.
    // PC Wi-Fi 변경 시 .env.local의 DEV_HOST 갱신 필요.
    host: getDevHost(),
    port: 5173,
    commands: {
      dev: "vite dev --host 0.0.0.0",
      build: "vite build",
    },
  },
  webViewProps: {
    type: "partner",
    bounces: false,
    pullToRefreshEnabled: false,
  },
  permissions: [],
  outdir: "dist",
});
