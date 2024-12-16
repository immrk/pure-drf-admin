import { viteBundler } from "@vuepress/bundler-vite";
import { defaultTheme } from "@vuepress/theme-default";
import { defineUserConfig } from "vuepress";

export default defineUserConfig({
  title: "Pure-Drf-Admin",
  lang: "zh-CN",
  dest: "dist/docs",
  base: "/docs/",
  bundler: viteBundler(),
  theme: defaultTheme({
    // 导航栏
    navbar: [
      {
        text: "首页",
        link: "/"
      },
      {
        text: "开发文档",
        prefix: "/devdoc/",
        children: ["introduction.md", "quickstart.md"]
      },
      {
        text: "项目预览",
        link: "https://puredrf.kworlds.cn/"
      },
      {
        text: "前端代码",
        link: "https://github.com/immrk/pure-drf-admin"
      },
      {
        text: "后端代码",
        link: "https://github.com/immrk/pure-drf-admin-backend"
      }
    ],
    sidebar: {
      "/devdoc/": [
        {
          text: "开发文档",
          // 相对路径会自动追加子路径前缀
          children: ["introduction.md", "quickstart.md"]
        }
      ],
      "/reference/": "heading"
    }
  })
});
