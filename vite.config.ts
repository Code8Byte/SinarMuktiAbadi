/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const variant = env.VITE_APP_VARIANT || (mode === 'st' ? 'st' : 'sma')

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      outDir: `dist/${variant}`,
      emptyOutDir: true,
    },
    test: {
      globals: true,
      environment: 'happy-dom',
    },
  }
})
