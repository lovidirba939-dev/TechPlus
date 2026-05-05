import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/',
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
    },
    build: {
        cssCodeSplit: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-core': ['react', 'react-dom'],
                    'react-router': ['react-router-dom'],
                    'framer': ['framer-motion'],
                    'network': ['axios'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
})

