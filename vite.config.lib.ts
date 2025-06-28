import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueCalendar',
      fileName: 'vue-calendar',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue', 'pinia', 'uuid', 'date-fns', 'date-fns-tz'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia',
          uuid: 'uuid',
          'date-fns': 'dateFns',
          'date-fns-tz': 'dateFnsTz'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css'
          }
          return assetInfo.name
        }
      }
    },
    cssCodeSplit: false,
    sourcemap: true
  }
}) 