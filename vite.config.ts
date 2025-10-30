import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_HASH__: JSON.stringify(Date.now().toString(36).slice(-6).toUpperCase())
  }
})
