
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'pdf-lib',
      'react-pdf',
      'react-pdf/dist/esm/entry.webpack',
      'buffer',
      'stream',
      'util'
    ],
    exclude: ['pdfmake'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    }
  },
  build: {
    commonjsOptions: {
      include: [/pdf-lib/, /react-pdf/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('pdf-lib') || id.includes('react-pdf')) {
            return 'pdf-libs';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  }
}));
