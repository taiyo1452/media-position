import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: 'docs',
  },
  plugins: [react(), basicSsl()],
  base: '/media-position/',
})
