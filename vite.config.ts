/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 対象ブラウザ(WebGL2対応)ではWOFF2が利用できるため、Fontsourceが互換用に
 * 併記する旧WOFFを除外する。フォントの字形・unicode-rangeは変更しない。
 */
const fontsourceWoff2Only = {
  name: 'fontsource-woff2-only',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!id.includes('/@fontsource/') || !/\.css(?:$|\?)/.test(id)) return null

    return code.replace(
      /,\s*url\(([^)]*\.woff)\)\s*format\((['"])woff\2\)/g,
      '',
    )
  },
}

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages(プロジェクトページ)配信用のサブパス
  base: '/yuyado-yamagasumi/',
  plugins: [fontsourceWoff2Only, react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
})
