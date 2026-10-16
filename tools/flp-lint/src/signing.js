// FLP Core Cryptographic Signing (FLP-SIG-V2) & Capability Gate (#5)

import crypto from 'node:crypto'

export const FLP_SIG_V2_DOMAIN = 'FLP-SIG-V2:'
export const FLP_CERT_V2_DOMAIN = 'FLP-CERT-V2:'

export const HIGH_RISK_CAPABILITIES = new Set([
  'network',
  'file_write',
  'database_write',
  'process',
  'secret_access',
])

function canonicalizeObject(v) {
  if (Array.isArray(v)) return v.map(canonicalizeObject)
  if (!v || typeof v !== 'object') return v
  const out = {}
  for (const k of Object.keys(v).sort()) {
    out[k] = canonicalizeObject(v[k])
  }
  return out
}

export function canonicalFlpDigest(doc) {
  const clone = JSON.parse(JSON.stringify(doc || {}))
  if (clone.meta && typeof clone.meta === 'object') {
    delete clone.meta.signature
    delete clone.meta.sigVersion
    delete clone.meta.publisherCert
  }
  const payload = `${FLP_SIG_V2_DOMAIN}${JSON.stringify(canonicalizeObject(clone))}`
  return crypto.createHash('sha256').update(payload, 'utf8').digest()
}

export function generateFlpEd25519KeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519')
  return {
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }),
    privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }),
  }
}

export function issueFlpPublisherCert({
  publisherId,
  publisherPublicKeyPem,
  rootPrivateKeyPem,
  expiresAt = new Date(Date.now() + 365 * 86400_000).toISOString(),
}) {
  const body = {
    version: 2,
    publisherId: String(publisherId),
    publisherPublicKeyPem: String(publisherPublicKeyPem).trim(),
    expiresAt,
  }
  const msg = Buffer.from(`${FLP_CERT_V2_DOMAIN}${JSON.stringify(canonicalizeObject(body))}`, 'utf8')
  const sig = crypto.sign(null, msg, rootPrivateKeyPem).toString('base64url')
  return Buffer.from(JSON.stringify({ ...body, sig }), 'utf8').toString('base64url')
}

export function verifyFlpPublisherCert(certBase64Url, rootPublicKeyPem, now = Date.now()) {
  try {
    const raw = JSON.parse(Buffer.from(String(certBase64Url || ''), 'base64url').toString('utf8'))
    if (raw.version !== 2 || !raw.publisherPublicKeyPem || !raw.sig) {
      return { valid: false, reason: 'malformed_cert' }
    }
    if (raw.expiresAt && Date.parse(raw.expiresAt) < now) {
      return { valid: false, reason: 'expired_cert' }
    }
    const { sig, ...body } = raw
    const msg = Buffer.from(`${FLP_CERT_V2_DOMAIN}${JSON.stringify(canonicalizeObject(body))}`, 'utf8')
    const ok = crypto.verify(null, msg, rootPublicKeyPem, Buffer.from(sig, 'base64url'))
    if (!ok) return { valid: false, reason: 'invalid_cert_signature' }
    return {
      valid: true,
      publisherId: body.publisherId,
      publisherPublicKeyPem: body.publisherPublicKeyPem,
    }
  } catch {
    return { valid: false, reason: 'malformed_cert' }
  }
}

export function signFlpBundleV2(doc, { publisherPrivateKeyPem, publisherCert = null }) {
  const copy = JSON.parse(JSON.stringify(doc || {}))
  if (!copy.meta || typeof copy.meta !== 'object') {
    throw new Error('FLP document must include a meta object')
  }
  const digest = canonicalFlpDigest(copy)
  const sig = crypto.sign(null, digest, publisherPrivateKeyPem).toString('base64url')
  copy.meta.sigVersion = 2
  copy.meta.signature = sig
  if (publisherCert) copy.meta.publisherCert = publisherCert
  return copy
}

export function verifyFlpBundleV2(doc, { rootPublicKeyPem = null, publisherPublicKeyPem = null } = {}) {
  if (!doc?.meta?.signature || doc?.meta?.sigVersion !== 2) {
    return { valid: false, reason: 'missing_v2_signature' }
  }
  let signerKeyPem = publisherPublicKeyPem
  let publisherId = null

  if (doc.meta.publisherCert && rootPublicKeyPem) {
    const certRes = verifyFlpPublisherCert(doc.meta.publisherCert, rootPublicKeyPem)
    if (!certRes.valid) return certRes
    signerKeyPem = certRes.publisherPublicKeyPem
    publisherId = certRes.publisherId
  }

  if (!signerKeyPem) {
    return { valid: false, reason: 'missing_signer_public_key' }
  }

  const digest = canonicalFlpDigest(doc)
  const ok = crypto.verify(null, digest, signerKeyPem, Buffer.from(doc.meta.signature, 'base64url'))
  if (!ok) return { valid: false, reason: 'signature_mismatch' }
  return { valid: true, sigVersion: 2, publisherId }
}

export function evaluateFlpCapabilities(doc) {
  const capabilities = new Set()
  for (const act of doc?.actions || []) {
    for (const se of act?.side_effects || []) capabilities.add(se)
  }
  for (const tool of doc?.meta?.contributes?.tools || []) {
    for (const se of tool?.side_effects || []) capabilities.add(se)
  }
  const highRisk = [...capabilities].filter((c) => HIGH_RISK_CAPABILITIES.has(c))
  return {
    capabilities: [...capabilities],
    highRisk,
    requiresWarning: highRisk.length > 0,
  }
}
