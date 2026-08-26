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
  build: { outDir: 'dist', sourcemap: false }
})
