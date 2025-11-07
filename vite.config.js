import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  server: {
    port: mode === 'staging' ? 8082 : 4000,
    proxy: {
      '/api': {
        target: 'https://meanstack.smartdatainc.com:8081',
        changeOrigin: true,
        secure: true
      }
    },
  }
}))