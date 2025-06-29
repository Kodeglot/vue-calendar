import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      cleanVueFileName: true,
      include: ['src'],
      exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts'],
      outputDir: 'dist/types',
      entryRoot: 'src',
      compilerOptions: {
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*']
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueCalendar',
      fileName: 'vue-calendar',
      formats: ['es']
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
        }
      }
    }
  }
})
