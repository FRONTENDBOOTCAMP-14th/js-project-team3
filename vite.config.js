import { defineConfig } from "vite";
import { resolve } from "path";
import postcssNested from 'postcss-nested';

export default defineConfig({
  base: "./",

  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      external: ['crypto'],
    },
    cssCodeSplit: false,
    minify: 'esbuild',
    target: 'es2015',
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },

  css: {
    postcss: {
      plugins: [
        postcssNested(),
      ],
    },
    modules: false,
    preprocessorOptions: {
      css: {
        additionalData: '',
      },
    },
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  server: {
    port: 3000,
    open: true,
  },

  optimizeDeps: {
    exclude: ['crypto', 'postcss'],
  },

  define: {
    global: 'globalThis',
    'process.env': {},
  },

  plugins: [],
});