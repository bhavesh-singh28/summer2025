import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
   server: {
    proxy: {
      '/api': 'profound-annually-alien.ngrok-free.app'
    }
  },
  plugins: [
    tailwindcss(),
    react()
  ],
})
