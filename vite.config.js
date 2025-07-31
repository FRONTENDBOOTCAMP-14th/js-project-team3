import { defineConfig } from "vite";
import { resolve } from "path";

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
  },

  css: {
    postcss: false,
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
    proxy: {
      "/api/chzzk": {
        target: "https://openapi.chzzk.naver.com",
        changeOrigin: true,
        rewrite: function(path) { return path.replace(/^\/api\/chzzk/, "/open/v1"); },
        secure: false,
      },
    },
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