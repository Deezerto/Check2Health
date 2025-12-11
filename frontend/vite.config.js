import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ mode }) => {
  return {
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    plugins: [react(), basicSsl()],
    server: {
      port: 5173,
      https: true,
      proxy: {
        '/api': {
          target: 'https://localhost:8443',
          secure: false, // Allow self-signed certificates for local dev
          changeOrigin: true
        }
      }
    }
  }
})
