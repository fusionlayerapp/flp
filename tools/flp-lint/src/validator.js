import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCHEMA_DIR = resolve(__dirname, '../../../schema')

function loadSchema(name) {
  return JSON.parse(readFileSync(join(SCHEMA_DIR, `${name}.json`), 'utf8'))
}

let _ajv = null
function getAjv() {
  if (_ajv) return _ajv
  _ajv = new Ajv({ allErrors: true, strict: false })
  addFormats(_ajv)
  // Register all schemas
  for (const kind of ['meta', 'policy', 'guideline', 'intent', 'strategy', 'routine', 'behavior', 'playbook', 'template', 'pack']) {
    try {
      _ajv.addSchema(loadSchema(kind), `https://flp.fusionlayer.app/schema/v1/${kind}`)
    } catch {
      // Schema file missing — validation for this kind will fall back gracefully
    }
  }
  return _ajv
}

const KIND_TO_SCHEMA = {
  policy: 'policy',
  guideline: 'guideline',
  intent: 'intent',
  strategy: 'strategy',
  routine: 'routine',
  behavior: 'behavior',
  playbook: 'playbook',
  template: 'template',
  pack: 'pack',
}

export function validate(doc) {
  const warnings = []
  const errors = []

  // Determine kind
  const kind = doc?.meta?.kind ?? doc?.kind
  if (!kind) {
    errors.push('Missing kind: add meta.kind (e.g. "policy") or kind field (for template/pack).')
    return { ok: false, errors, warnings }
  }

  const schemaKey = KIND_TO_SCHEMA[kind]
  if (!schemaKey) {
    errors.push(`Unknown kind: "${kind}". Valid kinds: ${Object.keys(KIND_TO_SCHEMA).join(', ')}.`)
    return { ok: false, errors, warnings }
  }

  const ajv = getAjv()
  const schemaUri = `https://flp.fusionlayer.app/schema/v1/${schemaKey}`
  const validateFn = ajv.getSchema(schemaUri)

  if (!validateFn) {
    warnings.push(`Schema for kind "${kind}" not found — skipping structural validation.`)
    return { ok: true, errors, warnings }
  }

  const valid = validateFn(doc)
  if (!valid) {
    for (const e of validateFn.errors ?? []) {
      const path = e.instancePath || '(root)'
      errors.push(`${path}: ${e.message}`)
    }
  }

  // Cross-cutting checks (beyond JSON Schema)
  if (doc?.meta?.id && !doc.meta.id.startsWith('@')) {
    warnings.push('meta.id should use scoped format "@namespace/slug" for public distribution.')
  }

  return { ok: errors.length === 0, errors, warnings }
}
