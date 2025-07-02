import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  root: 'demo',
  publicDir: 'demo',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 3001,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/': resolve(__dirname, 'src/')
    }
  },
  base: '/vue-calendar/'
}) 