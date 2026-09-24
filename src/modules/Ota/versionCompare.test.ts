import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  compareBundleVersions,
  isNewerBundle,
  parseBundleVersion,
  shouldApplyOtaUpdate,
} from './versionCompare.ts'

describe('parseBundleVersion', () => {
  it('parses semver + build', () => {
    assert.deepEqual(parseBundleVersion('1.2.0+42.abc1234'), {
      major: 1,
      minor: 2,
      patch: 0,
      build: 42,
      raw: '1.2.0+42.abc1234',
    })
  })
})

describe('compareBundleVersions', () => {
  it('orders by semver then build number', () => {
    assert.ok(compareBundleVersions('1.2.0+2.aaa', '1.2.0+1.bbb') > 0)
    assert.ok(compareBundleVersions('1.2.1+1.aaa', '1.2.0+99.bbb') > 0)
    assert.equal(compareBundleVersions('1.2.0+5.x', '1.2.0+5.y'), 0)
    assert.ok(compareBundleVersions('1.1.9+9.x', '1.2.0+1.y') < 0)
  })
})

describe('isNewerBundle', () => {
  it('detects newer remotes', () => {
    assert.equal(isNewerBundle('1.2.0+3.aaa', '1.2.0+2.bbb'), true)
    assert.equal(isNewerBundle('1.2.0+2.aaa', '1.2.0+2.bbb'), false)
    assert.equal(isNewerBundle('1.2.0+1.aaa', '1.2.0+2.bbb'), false)
  })
})

describe('shouldApplyOtaUpdate', () => {
  const base = {
    version: '1.2.0+10.deadbee',
    url: 'https://example.com/bundle.zip',
    checksum: 'abc',
    minNativeVersion: 7,
  }

  it('applies when newer and native is new enough', () => {
    assert.deepEqual(shouldApplyOtaUpdate(base, '1.2.0+9.old', 7), {
      apply: true,
      reason: 'newer',
    })
  })

  it('skips when up to date', () => {
    assert.equal(shouldApplyOtaUpdate(base, '1.2.0+10.deadbee', 7).apply, false)
  })

  it('skips when native versionCode is too low', () => {
    assert.deepEqual(shouldApplyOtaUpdate(base, '1.2.0+1.x', 6), {
      apply: false,
      reason: 'native-too-old',
    })
  })

  it('rejects invalid manifests', () => {
    assert.equal(
      shouldApplyOtaUpdate({ ...base, checksum: '' }, '1.0.0+1.x', 7).reason,
      'invalid-manifest',
    )
  })
})
