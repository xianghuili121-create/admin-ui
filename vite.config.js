import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

import Components from 'unplugin-vue-components/vite';
import MotionResolver from 'motion-v/resolver';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      dts: true,
      resolvers: [MotionResolver()],
    }),
  ],
  server: {
    port: 9090,
    host: '::',
    allowedHosts: ['ithui.cloud'],
    proxy: {
      '/api': {
        target: 'http://ithui.cloud:3000/',
        // target: 'http://192.168.0.222:3000/',
        // target: 'http://localhost:3000/',
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
