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

  if (kind === 'playbook' && Array.isArray(doc?.steps)) {
    const stepIds = new Set(doc.steps.map(s => s?.id).filter(Boolean))
    for (const step of doc.steps) {
      if (Array.isArray(step?.depends_on)) {
        for (const dep of step.depends_on) {
          if (!stepIds.has(dep)) {
            errors.push(`/steps/${step.id}/depends_on: references unknown step ID "${dep}"`)
          }
        }
      }
    }
  }

  if (kind === 'pack' && Array.isArray(doc?.actions)) {
    const seenRefs = new Set()
    for (const action of doc.actions) {
      const key = action?.name || action?.ref
      if (key && seenRefs.has(key)) {
        warnings.push(`Duplicate action binding "${key}" in pack.actions.`)
      }
      if (key) seenRefs.add(key)
    }
  }

  return { ok: errors.length === 0, errors, warnings }
}

/**
 * Validates cross-references between a Pack's `.flpk.yml` manifest, its `.flpb.yml` playbooks,
 * `.flp.yml` policy rules, and declared AAP action descriptors.
 */
export function validatePackCrossReferences(packDoc, context = {}) {
  const errors = []
  const warnings = []

  const packRes = validate(packDoc)
  errors.push(...packRes.errors)
  warnings.push(...packRes.warnings)

  const declaredActions = new Set()
  for (const act of packDoc?.actions ?? []) {
    if (act.name) declaredActions.add(act.name)
    if (act.ref) declaredActions.add(act.ref)
  }
  for (const desc of context.actions ?? []) {
    if (desc?.name) declaredActions.add(desc.name)
    if (desc?.id) declaredActions.add(desc.id)
  }

  for (const pb of context.playbooks ?? []) {
    const pbRes = validate(pb)
    if (!pbRes.ok) {
      errors.push(...pbRes.errors.map(e => `playbook(${pb?.meta?.id || 'unnamed'}): ${e}`))
    }
    for (const step of pb?.steps ?? []) {
      for (const allowed of step?.allowed_actions ?? []) {
        if (!declaredActions.has(allowed)) {
          errors.push(
            `playbook(${pb?.meta?.id || 'unnamed'}) step "${step.id}" references undeclared AAP action "${allowed}"`
          )
        }
      }
    }
  }

  for (const pol of context.policies ?? []) {
    const polRes = validate(pol)
    if (!polRes.ok) {
      errors.push(...polRes.errors.map(e => `policy(${pol?.meta?.id || 'unnamed'}): ${e}`))
    }
  }

  return { ok: errors.length === 0, errors, warnings }
}

export function validateFlpContributions(contributes) {
  if (!contributes) return { ok: true, errors: [] }
  if (typeof contributes !== 'object' || Array.isArray(contributes)) {
    return { ok: false, errors: ['contributes must be an object'] }
  }
  const errors = []
  if (contributes.commands !== undefined) {
    if (!Array.isArray(contributes.commands)) {
      errors.push('contributes.commands must be an array')
    } else {
      for (const c of contributes.commands) {
        if (!c?.name || typeof c.name !== 'string') errors.push('command.name is required in contributes.commands')
        if (!c?.description || typeof c.description !== 'string') errors.push(`command.description is required for "${c?.name || ''}"`)
      }
    }
  }
  if (contributes.panels !== undefined) {
    if (!Array.isArray(contributes.panels)) {
      errors.push('contributes.panels must be an array')
    } else {
      for (const p of contributes.panels) {
        if (!p?.id || typeof p.id !== 'string') errors.push('panel.id is required in contributes.panels')
        if (!p?.title || typeof p.title !== 'string') errors.push(`panel.title is required for "${p?.id || ''}"`)
      }
    }
  }
  if (contributes.tools !== undefined) {
    if (!Array.isArray(contributes.tools)) {
      errors.push('contributes.tools must be an array')
    } else {
      for (const t of contributes.tools) {
        if (!t?.name || typeof t.name !== 'string') errors.push('tool.name is required in contributes.tools')
        if (!t?.description || typeof t.description !== 'string') errors.push(`tool.description is required for "${t?.name || ''}"`)
      }
    }
  }
  return { ok: errors.length === 0, errors }
}

