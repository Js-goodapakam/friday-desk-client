import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: mode === 'local-dev' ? {
    'import.meta.env.VITE_API_URL': JSON.stringify(''),
    'import.meta.env.VITE_TELECMI_AGENT_USER_ID': JSON.stringify(''),
    'import.meta.env.VITE_TELECMI_AGENT_PASSWORD': JSON.stringify(''),
    'import.meta.env.VITE_TELECMI_SBC': JSON.stringify(''),
  } : {},
  server: { proxy: { "/api": mode === 'local-dev' ? 'http://127.0.0.1:3001' : 'http://localhost:3000' } },
}))
