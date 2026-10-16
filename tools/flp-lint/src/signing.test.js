import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  generateFlpEd25519KeyPair,
  issueFlpPublisherCert,
  signFlpBundleV2,
  verifyFlpBundleV2,
  evaluateFlpCapabilities,
} from './index.js'

describe('FLP Core FLP-SIG-V2 Signing & Capability Gate (#5)', () => {
  test('issues delegated publisher cert, signs FLP bundle with FLP-SIG-V2, and detects tampering', () => {
    const rootKeys = generateFlpEd25519KeyPair()
    const pubKeys = generateFlpEd25519KeyPair()

    const cert = issueFlpPublisherCert({
      publisherId: '@acme',
      publisherPublicKeyPem: pubKeys.publicKeyPem,
      rootPrivateKeyPem: rootKeys.privateKeyPem,
    })

    const doc = {
      meta: {
        uacp: '1.0.0',
        kind: 'policy',
        id: '@acme/eu-privacy',
        version: '1.0.0',
      },
      rules: [{ type: 'pii_block', action: 'redact', params: { categories: ['email'] } }],
    }

    const signed = signFlpBundleV2(doc, {
      publisherPrivateKeyPem: pubKeys.privateKeyPem,
      publisherCert: cert,
    })

    const verified = verifyFlpBundleV2(signed, { rootPublicKeyPem: rootKeys.publicKeyPem })
    assert.equal(verified.valid, true)
    assert.equal(verified.publisherId, '@acme')

    const tampered = JSON.parse(JSON.stringify(signed))
    tampered.rules[0].action = 'allow'
    const bad = verifyFlpBundleV2(tampered, { rootPublicKeyPem: rootKeys.publicKeyPem })
    assert.equal(bad.valid, false)
    assert.equal(bad.reason, 'signature_mismatch')
  })

  test('evaluates declared capabilities and flags high-risk side effects', () => {
    const cap = evaluateFlpCapabilities({
      kind: 'pack',
      actions: [
        { name: 'read_doc', side_effects: ['file_read'] },
        { name: 'post_webhook', side_effects: ['network', 'secret_access'] },
      ],
    })
    assert.equal(cap.requiresWarning, true)
    assert.deepEqual(cap.highRisk, ['network', 'secret_access'])
  })
})
