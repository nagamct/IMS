import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  define: {
    // Only define process.env if you specifically need it for MUI
    'process.env': {}
  }
})