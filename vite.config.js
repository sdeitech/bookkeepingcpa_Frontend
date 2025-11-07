import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Environment configuration
const getEnvironmentInfo = (mode) => {
  const isStaging = mode === 'staging';
  return {
    mode: mode,
    envName: isStaging ? 'STAGING' : 'DEVELOPMENT',
    port: isStaging ? 8082 : 4000,
    backendUrl: isStaging ? 'https://meanstack.smartdatainc.com:8081' : 'http://localhost:8081',
    frontendUrl: `http://localhost:${isStaging ? 8082 : 4000}`,
    proxyTarget: isStaging ? 'https://meanstack.smartdatainc.com:8081' : 'http://localhost:8081',
    isStaging
  };
};

// Log environment info
const logEnvironmentInfo = (mode) => {
  const env = getEnvironmentInfo(mode);
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🚀 SERVER STARTING 🚀                     ║
╠══════════════════════════════════════════════════════════════╣
║  Environment:    ${env.envName.padEnd(41)} ║
║  Frontend URL:   ${env.frontendUrl.padEnd(41)} ║
║  Backend URL:    ${env.backendUrl.padEnd(41)} ║
║  API Proxy:      ${env.proxyTarget.padEnd(41)} ║
║  Port:           ${env.port.toString().padEnd(41)} ║
╚══════════════════════════════════════════════════════════════╝
  `);
};

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Log environment info when server starts
  if (command === 'serve') {
    logEnvironmentInfo(mode);
  }

  return {
    plugins: [react()],
    server: {
      port: mode === 'staging' ? 8082 : 4000,
      proxy: {
        '/api': {
          target: mode === 'staging'
            ? 'https://meanstack.smartdatainc.com:8081'
            : 'http://localhost:8081',
          changeOrigin: true,
          secure: mode === 'staging'
        }
      },
    }
  };
});