import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }
const shortSha = (process.env.GITHUB_SHA || process.env.VITE_GIT_SHA || 'local').slice(0, 7)
const runNumber = process.env.GITHUB_RUN_NUMBER || process.env.VITE_BUILD_NUMBER || '0'
const bundleVersion = process.env.VITE_BUNDLE_VERSION || `${pkg.version}+${runNumber}.${shortSha}`
const nativeVersionCode = process.env.VITE_NATIVE_VERSION_CODE || '7'

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_BUNDLE_VERSION': JSON.stringify(bundleVersion),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    'import.meta.env.VITE_NATIVE_VERSION_CODE': JSON.stringify(nativeVersionCode),
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
})
