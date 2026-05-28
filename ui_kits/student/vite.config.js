import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  server: {
    proxy: {
      // 与生产 Nginx 一致：/api → Java 根路径（去掉 /api）
      '/api': {
        target: 'http://127.0.0.1:9100',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '')
      },
      '/fudan': {
        target: 'http://127.0.0.1:9100',
        changeOrigin: true
      }
    }
  }
})
