import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Tauri expects a fixed port
  server: {
    port: 5173,
    strictPort: true,
  },

  // Build configuration
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          mantine: ['@mantine/core', '@mantine/hooks', '@mantine/notifications', '@mantine/modals'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          icons: ['@tabler/icons-react'],
        },
      },
    },
  },

  // Path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['@mantine/core', '@mantine/hooks', '@reduxjs/toolkit', 'react-redux'],
  },

  // Clear screen on dev
  clearScreen: false,
});
