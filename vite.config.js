import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Use mode to determine environment (development, staging, production)
  const isStaging = mode === 'staging';
  const isDevelopment = mode === 'development';
  
  // Log environment info when server starts
  if (command === 'serve') {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🚀 SERVER STARTING 🚀                     ║
╠══════════════════════════════════════════════════════════════╣
║  Environment:    ${(isStaging ? 'STAGING' : 'DEVELOPMENT').padEnd(41)} ║
║  Detection:      Command Line Mode.                           ║
║  Port:           ${(isStaging ? '8082' : '4000').padEnd(41)} ║
║  Backend:        ${(isStaging ? 'https://meanstack.smartdatainc.com:8081' : 'http://localhost:8081').padEnd(41)} ║
╚══════════════════════════════════════════════════════════════╝
    `);
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: isStaging ? 8082 : 4000,
      // Remove proxy for staging since we need direct API calls
      // Proxy is only useful for development with same-origin policy
      proxy: isDevelopment ? {
        '/api': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          secure: false
        }
      } : undefined,
    }
  };
});