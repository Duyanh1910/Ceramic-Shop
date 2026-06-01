import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          const normalizedId = id.replace(/\\/g, "/");

          if (
            /node_modules\/(react|react-dom|react-router-dom|scheduler)\//.test(
              normalizedId,
            )
          ) {
            return "react-vendor";
          }

          if (
            normalizedId.includes("node_modules/antd/") ||
            normalizedId.includes("node_modules/@ant-design/")
          ) {
            return "antd-vendor";
          }

          if (
            normalizedId.includes("node_modules/recharts/") ||
            normalizedId.includes("node_modules/d3-")
          ) {
            return "charts-vendor";
          }

          if (
            normalizedId.includes("node_modules/tinymce/") ||
            normalizedId.includes("node_modules/@tinymce/") ||
            normalizedId.includes("node_modules/@tiptap/")
          ) {
            return "editor-vendor";
          }

          if (
            normalizedId.includes("node_modules/axios/") ||
            normalizedId.includes("node_modules/dayjs/") ||
            normalizedId.includes("node_modules/socket.io-client/") ||
            normalizedId.includes("node_modules/react-helmet-async/") ||
            normalizedId.includes("node_modules/react-ga4/") ||
            normalizedId.includes("node_modules/aos/")
          ) {
            return "app-vendor";
          }
        },
      },
    },
  },
  server: {
    open: true,
    proxy: {
      "/api": {
        target: "https://ceramic-shop-u8ak.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
