import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base '/' untuk Vercel
export default defineConfig({
  plugins: [react()],
  base: '/',
})
