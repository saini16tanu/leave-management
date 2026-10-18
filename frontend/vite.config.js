import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // always run on port 5173 because the backend allows only this address
  server: {
    port: 5173,
    strictPort: true,
  },
})
