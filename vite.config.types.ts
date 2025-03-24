import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      cleanVueFileName: true,
      include: ['src'],
      exclude: ['node_modules', 'dist', '**/*.test.ts'],
      outputDir: 'dist/types'
    })
  ],
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'VueTailwindCalendar',
      fileName: 'vue-tailwind-calendar',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue', 'tailwindcss'],
      output: {
        globals: {
          vue: 'Vue',
          tailwindcss: 'tailwindcss'
        }
      }
    }
  }
})
