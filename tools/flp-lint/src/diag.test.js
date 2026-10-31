import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { FLP_ERROR_CATALOG, inspectFlpFile, runFlpDoctor } from './index.js'

test('FLP doctor and error catalog pass readiness checks (#9)', () => {
  const doc = runFlpDoctor()
  assert.equal(doc.healthy, true)
  assert.equal(doc.protocol, 'FLP/1.0')
  assert.ok(Object.keys(FLP_ERROR_CATALOG).length >= 4)
})

test('inspectFlpFile inspects example FLP primitive and computes canonical digest (#9)', () => {
  const file = resolve('C:/Projects/flp/examples/packs/vendor-agnostic-research-agent/pack.flpk.yml')
  const info = inspectFlpFile(file)
  assert.equal(info.ok, true)
  assert.equal(info.kind, 'pack')
  assert.ok(typeof info.canonicalSha256 === 'string' && info.canonicalSha256.length === 64)
})

test('flp-lint CLI writes to CLI and optional --output file (#10)', async () => {
  const { execFileSync } = await import('node:child_process')
  const { mkdtempSync, readFileSync, rmSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const { join } = await import('node:path')
  const tmpDir = mkdtempSync(join(tmpdir(), 'flp-out-'))
  try {
    const outFile = join(tmpDir, 'doctor.json')
    const cliOut = execFileSync(
      process.execPath,
      [resolve('C:/Projects/flp/tools/flp-lint/bin/flp-lint.js'), 'doctor', '--output', outFile],
      { encoding: 'utf8' },
    )
    assert.match(cliOut, /HEALTHY/)
    assert.equal(JSON.parse(readFileSync(outFile, 'utf8')).healthy, true)
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

