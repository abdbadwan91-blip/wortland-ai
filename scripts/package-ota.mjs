#!/usr/bin/env node
/**
 * Zip native-base dist (VITE_BASE=/) for Capgo self-hosted OTA and write
 * ota/latest.json + ota/bundle-<version>.zip into the Pages dist.
 *
 *   node scripts/package-ota.mjs --pages-dist dist --native-dist dist-native
 */
import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

function arg(name, fallback) {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : fallback
}

const pagesDist = resolve(arg('--pages-dist', 'dist'))
const nativeDist = resolve(arg('--native-dist', 'dist-native'))
const publicBase = (process.env.OTA_PUBLIC_BASE || 'https://abdbadwan91-blip.github.io/wortland-ai').replace(/\/$/, '')
const minNative = Number.parseInt(process.env.MIN_NATIVE_VERSION || '7', 10)

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const shortSha = (process.env.GITHUB_SHA || process.env.VITE_GIT_SHA || 'local').slice(0, 7)
const runNumber = process.env.GITHUB_RUN_NUMBER || process.env.VITE_BUILD_NUMBER || '0'
const version = process.env.VITE_BUNDLE_VERSION || `${pkg.version}+${runNumber}.${shortSha}`

if (!existsSync(nativeDist)) {
  console.error(`Native dist missing: ${nativeDist}`)
  process.exit(1)
}
if (!existsSync(pagesDist)) {
  console.error(`Pages dist missing: ${pagesDist}`)
  process.exit(1)
}

const otaDir = join(pagesDist, 'ota')
mkdirSync(otaDir, { recursive: true })

const zipName = `bundle-${version.replace(/[^a-zA-Z0-9._+-]/g, '_')}.zip`
const zipPath = join(otaDir, zipName)
rmSync(zipPath, { force: true })

const zipResult = spawnSync('zip', ['-r', '-q', zipPath, '.'], {
  cwd: nativeDist,
  stdio: 'inherit',
})
if (zipResult.status !== 0) {
  console.error('zip failed — install zip (apt install zip)')
  process.exit(zipResult.status ?? 1)
}

const bytes = readFileSync(zipPath)
const checksum = createHash('sha256').update(bytes).digest('hex')
const url = `${publicBase}/ota/${zipName}`
const latest = { version, url, checksum, minNativeVersion: minNative }

writeFileSync(join(otaDir, 'latest.json'), JSON.stringify(latest, null, 2) + '\n')
cpSync(zipPath, join(otaDir, 'latest-bundle.zip'))

console.log(JSON.stringify({ ...latest, bytes: bytes.length }, null, 2))
