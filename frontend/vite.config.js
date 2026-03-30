import { defineConfig } from 'vite'

export default defineConfig({
  // Raiz do projeto: usa o index.html da raiz do frontend (não o src/)
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  }
})
