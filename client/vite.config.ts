import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'process.env.API_SERVER': JSON.stringify(env.VITE_API_SERVER),
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
  plugins: [react()],
}})
