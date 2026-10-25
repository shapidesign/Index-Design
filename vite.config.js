import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// public/privacy and public/terms are real HTML files. Serve them without the .html path.
const legalPages = () => {
  const map = {
    '/privacy': '/privacy/index.html',
    '/privacy/': '/privacy/index.html',
    '/terms': '/terms/index.html',
    '/terms/': '/terms/index.html',
  }
  const rewrite = (req, _res, next) => {
    const [path, query] = String(req.url || '').split('?')
    if (map[path]) req.url = map[path] + (query ? `?${query}` : '')
    next()
  }
  return {
    name: 'legal-pages',
    configureServer(server) {
      server.middlewares.use(rewrite)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    legalPages(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        // Keep the original Host header so the API guard's same-origin
        // referer check passes in local dev (guard compares Referer host to Host)
        changeOrigin: false,
      },
    },
  },
})
