import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // إزالة componentTagger مؤقتاً لضمان الاستقرار
    // يمكن إضافته لاحقاً بعد اختبار دعم pdfmake
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'pdfmake/build/pdfmake',
      'pdfmake/build/vfs_fonts',
      'buffer', // ضروري لـ pdfmake
      'stream', // ضروري لـ pdfmake
      'util', // ضروري لـ pdfmake
      'zlib' // ضروري لـ pdfmake
    ],
    esbuildOptions: {
      // دعم المكتبات التي تستخدم global و process
      define: {
        global: 'globalThis',
        'process.env': JSON.stringify({})
      },
      plugins: [
        // حل مشكلة buffer لمكتبات Node.js
        {
          name: 'fix-node-globals-polyfill',
          setup(build) {
            build.onResolve({ filter: /_virtual-process-polyfill_\.js/ }, ({ path }) => ({ path }))
          },
        }
      ]
    }
  },
  build: {
    commonjsOptions: {
      include: [/pdfmake/, /node_modules/],
      transformMixedEsModules: true, // مهم للتوافق
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // تجميع جميع مكتبات PDF في chunk واحد
          if (id.includes('pdfmake') || id.includes('react-pdf')) {
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
    // حل مشكلة global في المتصفح
    global: 'window',
    'process.env': process.env,
  }
}));
