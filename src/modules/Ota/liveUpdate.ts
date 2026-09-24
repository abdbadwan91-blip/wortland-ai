import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import {
  shouldApplyOtaUpdate,
  type OtaLatestManifest,
} from './versionCompare'
import { showOtaToast } from './otaToast'

/** Self-hosted OTA endpoint on GitHub Pages (native WebView uses base "/"). */
export const OTA_LATEST_URL =
  'https://abdbadwan91-blip.github.io/wortland-ai/ota/latest.json'

export function getEmbeddedBundleVersion(): string {
  return import.meta.env.VITE_BUNDLE_VERSION || import.meta.env.VITE_APP_VERSION || '0.0.0+0'
}

export function getEmbeddedAppVersion(): string {
  return import.meta.env.VITE_APP_VERSION || '0.0.0'
}

export function getEmbeddedNativeVersionCode(): number {
  return Number.parseInt(import.meta.env.VITE_NATIVE_VERSION_CODE || '0', 10) || 0
}

export type OtaCheckResult =
  | { status: 'skipped'; reason: string }
  | { status: 'up-to-date'; latest: OtaLatestManifest }
  | { status: 'native-too-old'; latest: OtaLatestManifest }
  | { status: 'downloaded'; latest: OtaLatestManifest }
  | { status: 'error'; error: string }

let checking = false

/**
 * Call as early as possible on native so Capgo does not roll back a good bundle.
 * Safe no-op on web.
 */
export async function notifyNativeAppReady(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    await CapacitorUpdater.notifyAppReady()
  } catch {
    // Never block app start
  }
}

async function resolveNativeVersionCode(): Promise<number> {
  try {
    const info = await App.getInfo()
    const fromBuild = Number.parseInt(info.build || '', 10)
    if (Number.isFinite(fromBuild) && fromBuild > 0) return fromBuild
  } catch {
    // fall through
  }
  return getEmbeddedNativeVersionCode()
}

export async function fetchLatestManifest(
  url: string = OTA_LATEST_URL,
): Promise<OtaLatestManifest> {
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  })
  if (!res.ok) throw new Error(`latest.json HTTP ${res.status}`)
  const data = (await res.json()) as OtaLatestManifest
  return data
}

/**
 * Background check: download zip if newer, schedule apply via next() so the
 * kid is not interrupted mid-game. Bundle activates on next launch/background.
 */
export async function checkAndDownloadOta(options?: {
  showToast?: boolean
  toastMessage?: string
}): Promise<OtaCheckResult> {
  if (!Capacitor.isNativePlatform()) {
    return { status: 'skipped', reason: 'not-native' }
  }
  if (checking) return { status: 'skipped', reason: 'in-progress' }
  checking = true
  try {
    const latest = await fetchLatestManifest()
    const current = getEmbeddedBundleVersion()
    const nativeCode = await resolveNativeVersionCode()
    const decision = shouldApplyOtaUpdate(latest, current, nativeCode)
    if (decision.reason === 'up-to-date') {
      return { status: 'up-to-date', latest }
    }
    if (decision.reason === 'native-too-old') {
      return { status: 'native-too-old', latest }
    }
    if (!decision.apply) {
      return { status: 'skipped', reason: decision.reason }
    }

    const bundle = await CapacitorUpdater.download({
      url: latest.url,
      version: latest.version,
      checksum: latest.checksum,
    })
    // Apply on next background / relaunch — never interrupt mid-game
    await CapacitorUpdater.next({ id: bundle.id })

    if (options?.showToast !== false) {
      showOtaToast(
        options?.toastMessage ||
          'Update ready — it will apply the next time you open the game.',
      )
    }
    return { status: 'downloaded', latest }
  } catch (err) {
    return {
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
    }
  } finally {
    checking = false
  }
}

/** Soft-start OTA after first paint (native only). */
export function startOtaBackgroundCheck(toastMessage: string): void {
  if (!Capacitor.isNativePlatform()) return
  // Defer so splash / first screen aren't competing for bandwidth
  window.setTimeout(() => {
    void checkAndDownloadOta({ showToast: true, toastMessage })
  }, 2500)
}
