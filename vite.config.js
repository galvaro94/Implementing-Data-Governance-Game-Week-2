import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Implementing-Data-Governance-Game-Week-2/',
  server: {
    port: 3000,
    host: true
  }
})