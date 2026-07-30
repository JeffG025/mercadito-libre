import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 5174 fijo: SistemaBelkis ocupa el 5173 y el CORS del back apunta aquí.
    port: 5174,
    strictPort: true,
    // Reenvía /api al backend en 8085.
    proxy: {
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
    },
  },
})
