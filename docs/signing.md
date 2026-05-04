# FLP Primitive Signing

Marketplace-distributed primitives can carry an Ed25519 detached signature to verify authorship and integrity.

## Signature format

A signed primitive archive is a ZIP containing:

```
<primitive-name>.flp.yml     ← the primitive file
<primitive-name>.sig          ← Ed25519 detached signature (raw bytes, 64 bytes)
<primitive-name>.pub          ← author's Ed25519 public key (PEM, optional — verifier may resolve from registry)
```

The signature is computed over the **canonical form** of the primitive file:
1. Parse the YAML primitive.
2. Re-serialise to JSON with sorted keys, no trailing whitespace.
3. Sign the UTF-8 bytes of the canonical JSON using `Ed25519`.

## Key format

Public keys are PEM-encoded Ed25519 keys (standard OpenSSL / Node.js `crypto` output):

```
-----BEGIN PUBLIC KEY-----
<base64>
-----END PUBLIC KEY-----
```

## Verification

```js
import { verify, createPublicKey } from 'node:crypto'
import { readFileSync } from 'node:fs'

const pubKeyPem = readFileSync('author.pub', 'utf8')
const pubKey = createPublicKey(pubKeyPem)
const sig = readFileSync('primitive.sig')            // 64 raw bytes
const canonical = canonicalise(readFileSync('primitive.flp.yml', 'utf8'))

const ok = verify(null, Buffer.from(canonical, 'utf8'), pubKey, sig)
console.log(ok ? 'VALID' : 'INVALID')
```

## Signing (author)

```js
import { sign, generateKeyPairSync } from 'node:crypto'

const { privateKey } = generateKeyPairSync('ed25519')
const canonical = canonicalise(primitiveYaml)
const sig = sign(null, Buffer.from(canonical, 'utf8'), privateKey)
// sig is 64 bytes — write to <name>.sig
```

## Notes

- Signing is **optional** for reference primitives in this repo. It is **required** for primitives published to the FusionLayer marketplace.
- The canonical form function is exported from `flp-lint` as `canonicalise(yaml: string): string`.
- Key management (rotation, revocation) is handled by the marketplace registry, not this spec.
