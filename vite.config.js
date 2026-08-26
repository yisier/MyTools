import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin'
const pathSrc = path.resolve(__dirname, 'src')



// const MonacoWebpackPlugin = path.resolve(__dirname('monaco-editor-webpack-plugin'))
// let MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin'


// https://vitejs.dev/config/
export default defineConfig({
  base: "/",

  server: {
    host: "127.0.0.1",
    port: Number(process.env.WAILS_VITE_PORT) || 9245,
    strictPort: true,
  },

  resolve: {
    alias: {
      '@': pathSrc,
    },
  },
  plugins: [
    Vue(),
    AutoImport(
      {
      // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
      imports: ['vue'],

      resolvers: [
        ElementPlusResolver(),

        // 自动导入图标组件
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
      dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
    }),
    Components({
      resolvers: [
        // 自动注册图标组件
        IconsResolver({
          enabledCollections: ['ep'],
        }),

        // 自动导入 Element Plus 组件
        ElementPlusResolver(),

      ],
      dts: path.resolve(pathSrc, 'components.d.ts'),
    }),
    Icons({
      autoInstall: true,
    }),
    // new MonacoWebpackPlugin()
  ],
  configureWebpack: {
    plugins: [
      new MonacoWebpackPlugin()
    ]
  }
})
