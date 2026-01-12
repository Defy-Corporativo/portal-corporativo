import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow using SUPABASE_* variables from .env alongside the standard VITE_* prefix
  envPrefix: ['VITE_', 'SUPABASE_'],
})
