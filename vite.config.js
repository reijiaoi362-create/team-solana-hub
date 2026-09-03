import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    allowedHosts: ['Teamsolanahub.com'],
    proxy: {
      '/api/mojang': {
        target: 'https://api.mojang.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mojang/, '/users/profiles/minecraft'),
      },
      '/api/discord': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
