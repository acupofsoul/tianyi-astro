import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: ['**/.*', '**/*.tmp*', '**/*.tmpdir/**']
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // three.js 单独成块：它只在详情页动态 import，独立成 chunk 后
    // 可以长期缓存，首页/列表页的改动不会让它失效。
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (/node_modules[\\/]three/.test(id)) return 'three'
          return undefined
        }
      }
    }
  }
})
