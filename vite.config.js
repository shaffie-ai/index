import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base untuk GitHub Pages — mesti sama dengan nama repo
export default defineConfig({
  plugins: [react()],
  base: '/index/',
})
