import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        trilhas: resolve(__dirname, 'src/pages/trilhas/trilhas.html'),
        dicas: resolve(__dirname, 'src/pages/dicas/dicas.html'),
        galeria: resolve(__dirname, 'src/pages/galeria/galeria.html'),
        inscricao: resolve(__dirname, 'src/pages/form-inscricao/inscricao.html'),
      }
    }
  }
})