import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Auto-detect environment based on hostname or command line
const detectEnvironment = (mode) => {
  // Priority 1: Explicit mode from command line
  if (mode) {
    return mode;
  }
  
  // Priority 2: Host-based detection for deployment
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isStagingHost = hostname === '44.211.113.36' || hostname.includes('44.211.113.36');
  
  if (isStagingHost) {
    return 'staging';
  }
  
  // Priority 3: Development by default
  return 'development';
};

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
  const detectionMethod = mode ? 'Command Line' : 'Auto-Detected';
  
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🚀 SERVER STARTING 🚀                     ║
╠══════════════════════════════════════════════════════════════╣
║  Environment:    ${env.envName.padEnd(41)} ║
║  Detection:      ${detectionMethod.padEnd(41)} ║
║  Frontend URL:   ${env.frontendUrl.padEnd(41)} ║
║  Backend URL:    ${env.backendUrl.padEnd(41)} ║
║  API Proxy:      ${env.proxyTarget.padEnd(41)} ║
║  Port:           ${env.port.toString().padEnd(41)} ║
╚══════════════════════════════════════════════════════════════╝
  `);
};

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Auto-detect environment if not explicitly set
  const detectedMode = detectEnvironment(mode);
  
  // Log environment info when server starts
  if (command === 'serve') {
    logEnvironmentInfo(detectedMode);
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: detectedMode === 'staging' ? 8082 : 4000,
      proxy: {
        '/api': {
          target: detectedMode === 'staging'
            ? 'https://meanstack.smartdatainc.com:8081'
            : 'http://localhost:8081',
          changeOrigin: true,
          secure: detectedMode === 'staging'
        }
      },
    }
  };
});