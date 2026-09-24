/**
 * Bundle versions look like: "1.2.0+42.a1b2c3d"
 * Compare package semver first, then the numeric run number after '+'.
 * Returns negative if a < b, 0 if equal, positive if a > b.
 */
export function parseBundleVersion(version: string): {
  major: number
  minor: number
  patch: number
  build: number
  raw: string
} {
  const raw = String(version || '').trim()
  const [core, meta = '0'] = raw.split('+')
  const parts = core.split('.').map((p) => Number.parseInt(p, 10) || 0)
  const major = parts[0] ?? 0
  const minor = parts[1] ?? 0
  const patch = parts[2] ?? 0
  const buildMatch = meta.match(/^(\d+)/)
  const build = buildMatch ? Number.parseInt(buildMatch[1], 10) : 0
  return { major, minor, patch, build, raw }
}

export function compareBundleVersions(a: string, b: string): number {
  const left = parseBundleVersion(a)
  const right = parseBundleVersion(b)
  if (left.major !== right.major) return left.major - right.major
  if (left.minor !== right.minor) return left.minor - right.minor
  if (left.patch !== right.patch) return left.patch - right.patch
  return left.build - right.build
}

export function isNewerBundle(remote: string, current: string): boolean {
  return compareBundleVersions(remote, current) > 0
}

export type OtaLatestManifest = {
  version: string
  url: string
  checksum: string
  minNativeVersion: number
}

export function shouldApplyOtaUpdate(
  latest: OtaLatestManifest,
  currentBundleVersion: string,
  nativeVersionCode: number,
): { apply: boolean; reason: string } {
  if (!latest?.version || !latest?.url || !latest?.checksum) {
    return { apply: false, reason: 'invalid-manifest' }
  }
  if (Number(latest.minNativeVersion || 0) > nativeVersionCode) {
    return { apply: false, reason: 'native-too-old' }
  }
  if (!isNewerBundle(latest.version, currentBundleVersion)) {
    return { apply: false, reason: 'up-to-date' }
  }
  return { apply: true, reason: 'newer' }
}
