import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // @clerk/react/legacy es un subpath separado del paquete principal @clerk/react;
    // sin incluirlo acá, Vite lo pre-empaqueta por su cuenta la primera vez que se usa
    // (fuera del escaneo inicial) con una copia de React distinta a la ya optimizada,
    // lo que rompe el contexto de hooks ("Cannot read properties of null (reading
    // 'useContext')") en cuanto AuthModal llama a useSignIn().
    include: ['@clerk/react/legacy'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@ui': path.resolve(__dirname, 'src/shared/ui'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@hooks': path.resolve(__dirname, 'src/hooks')
    },
  },
})
