import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pieces from '@pieces-js/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), pieces.vite()]
})
