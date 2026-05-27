import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/docs/",
  title: "Pottery Shop Docs",
  description: "Developer documentation and Swagger API reference",
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "Developer Guide", link: "/DEVELOPMENT" },
      { text: "Swagger API", link: "/api" },
    ],
    sidebar: [
      {
        text: "Documentation",
        items: [
          { text: "Overview", link: "/" },
          { text: "Developer Guide", link: "/DEVELOPMENT" },
          { text: "Swagger API", link: "/api" },
        ],
      },
    ],
    search: {
      provider: "local",
    },
  },
});
