import { defineConfig } from '@vben/vite-config';

// import vue from '@vitejs/plugin-vue';
// import vueJsx from '@vitejs/plugin-vue-jsx';
// import { visualizer } from 'rollup-plugin-visualizer';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';
// import { cool } from "@cool-vue/vite-plugin";

export default defineConfig(async () => {
  return {
    application: {},
    plugins: [
      vue(),
      compression(),
      vueJsx(),
      // vueDevTools(),
      // cool({
      //   proxy,
      //   type: 'admin',
      // }),
      visualizer({
        brotliSize: true,
        gzipSize: true,
        open: false,
      }),
    ],
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            // target: 'http://localhost:5320/api',
            target: 'https://hpay.jyoou.com/huiwsper/api',
            ws: true,
          },
          '/huiwsper/admin': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/huiwsper\/admin/, ''),
            // mock代理目标地址
            // target: 'http://localhost:5320/api',
            target: 'https://hpay.jyoou.com/huiwsper/admin',
            ws: true,
          },
        },
      },
    },
  };
});
