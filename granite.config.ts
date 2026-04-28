import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "julook-web",
  brand: {
    displayName: "주룩",
    primaryColor: "#FFC805", // iOS DesignSystem primary
    icon: "/julook-icon.png", // public/julook-icon.png — 콘솔 등록 시 절대 URL로 교체 필요
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
