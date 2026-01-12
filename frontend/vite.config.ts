import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        // Allow the specific VM hostname to bypass security check
        allowedHosts: ['paul-vmware-virtual-platform', 'localhost', '127.0.0.1'],
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            }
        }
    }
})
