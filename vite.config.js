import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  // base: './', // 请勿删除此语句，否则将导致部署失败

  base: '/down/', // 请勿删除此语句，否则将导致部署失败
  server: {
    host: true
  },
  build: {

    rollupOptions: {

      manualChunks(id) {
        if (id.includes('node_modules')) {
          // 让每个插件都打包成独立的文件
          return id.toString().split('node_modules/')[1].split('/')[0].toString()
        }
      },
      output: {
        chunkFileNames: 'js/[name]-[hash].js', // 引入文件名的名称
        entryFileNames: 'js/[name]-[hash].js', // 包的入口文件名称
        assetFileNames: '[ext]/[name]-[hash].[ext]' // 资源文件像 字体，图片等
      }
    }
  },

  plugins: [

    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
