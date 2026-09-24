/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUNDLE_VERSION: string
  readonly VITE_APP_VERSION: string
  readonly VITE_NATIVE_VERSION_CODE: string
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
