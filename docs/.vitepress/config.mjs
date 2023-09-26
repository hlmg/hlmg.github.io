import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "StudyLog",
  description: "A Site Description",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/Misc/markdown-examples' }
    ],
    sidebar: getSidebar(),
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    outline: "deep"
  }
})

// https://github.com/jooy2/vitepress-sidebar#options
function getSidebar() {
  return generateSidebar({
    documentRootPath: '/docs',
    useTitleFromFileHeading: true,
    collapsed: true,
    collapseDepth: 2,
    sortMenusOrderNumerically: true
  })
}
