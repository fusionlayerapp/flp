import { readFileSync } from 'node:fs'
import yaml from 'js-yaml'
import { lint } from './lint.js'
import {
  canonicalFlpDigest,
  generateFlpEd25519KeyPair,
  signFlpBundleV2,
  verifyFlpBundleV2,
  evaluateFlpCapabilities,
} from './signing.js'

export const FLP_ERROR_CATALOG = Object.freeze({
  E_FLP_SCHEMA_INVALID: {
    code: 'E_FLP_SCHEMA_INVALID',
    level: 'ERROR',
    category: 'schema',
    retryable: false,
    message: 'FLP primitive YAML/JSON does not conform to its published schema.',
    hint: 'Run `flp-lint <file>` and ensure meta.kind, meta.id, and required primitive fields are valid.',
  },
  E_FLP_SIGNATURE_MISMATCH: {
    code: 'E_FLP_SIGNATURE_MISMATCH',
    level: 'SECURITY',
    category: 'crypto',
    retryable: false,
    message: 'FLP-SIG-V2 Ed25519 signature or publisher certificate verification failed.',
    hint: 'Re-sign the bundle with `signFlpBundleV2` and verify the root/publisher public key.',
  },
  E_FLP_HIGH_RISK_CAPABILITY: {
    code: 'E_FLP_HIGH_RISK_CAPABILITY',
    level: 'WARN',
    category: 'security',
    retryable: false,
    message: 'FLP bundle requests high-risk side effects (network, file_write, database_write, process, secret_access).',
    hint: 'Prompt the user for explicit capability approval before activating the primitive.',
  },
  E_FLP_PACK_XREF_BROKEN: {
    code: 'E_FLP_PACK_XREF_BROKEN',
    level: 'ERROR',
    category: 'pack',
    retryable: false,
    message: 'FLP pack references a missing or invalid policy/playbook primitive.',
    hint: 'Verify all relative `ref` paths and policy IDs inside `.flpk.yml`.',
  },
})

export function inspectFlpFile(filePath) {
  const lintRes = lint(filePath)
  let doc = null
  try {
    doc = yaml.load(readFileSync(filePath, 'utf8'))
  } catch {}
  const caps = doc ? evaluateFlpCapabilities(doc) : { capabilities: [], highRisk: [], requiresWarning: false }
  const digestHex = doc ? canonicalFlpDigest(doc).toString('hex') : null
  return {
    protocol: 'FLP/1.0',
    file: filePath,
    ok: lintRes.ok,
    kind: doc?.meta?.kind || doc?.kind || null,
    id: doc?.meta?.id || doc?.id || null,
    version: doc?.meta?.version || doc?.version || null,
    sigVersion: doc?.meta?.sigVersion || null,
    canonicalSha256: digestHex,
    capabilities: caps,
    errors: lintRes.errors || [],
    warnings: lintRes.warnings || [],
  }
}

export function runFlpDoctor() {
  const checks = []
  try {
    const kp = generateFlpEd25519KeyPair()
    const signed = signFlpBundleV2(
      { meta: { kind: 'policy', id: 'doc-policy', version: '1.0.0' }, rules: [] },
      { publisherPrivateKeyPem: kp.privateKeyPem },
    )
    const verified = verifyFlpBundleV2(signed, { publisherPublicKeyPem: kp.publicKeyPem })
    checks.push({
      name: 'flp_sig_v2_ed25519',
      status: verified.valid ? 'ok' : 'error',
      detail: 'FLP-SIG-V2 Ed25519 signing & verification ready',
    })
  } catch (err) {
    checks.push({ name: 'flp_sig_v2_ed25519', status: 'error', detail: err.message })
  }

  checks.push({
    name: 'error_catalog',
    status: Object.keys(FLP_ERROR_CATALOG).length >= 4 ? 'ok' : 'error',
    detail: `${Object.keys(FLP_ERROR_CATALOG).length} structured error codes registered`,
  })

  return {
    healthy: checks.every((c) => c.status === 'ok'),
    protocol: 'FLP/1.0',
    checks,
  }
}
