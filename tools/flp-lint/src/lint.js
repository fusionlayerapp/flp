import { readFileSync } from 'node:fs'
import { extname } from 'node:path'
import yaml from 'js-yaml'
import { validate } from './validator.js'

const EXT_TO_KIND = {
  '.flp.yml': 'policy',
  '.flg.yml': 'guideline',
  '.fli.yml': 'intent',
  '.fln.yml': 'strategy',
  '.flb.yml': 'behavior',
  '.flpb.yml': 'playbook',
  '.flr.yml': 'routine',
  '.flt.yml': 'template',
  '.flpk.yml': 'pack',
}

function detectKindFromExtension(filePath) {
  const lower = filePath.toLowerCase()
  for (const [ext, kind] of Object.entries(EXT_TO_KIND)) {
    if (lower.endsWith(ext)) return kind
  }
  return null
}

export function lint(filePath) {
  let raw
  try {
    raw = readFileSync(filePath, 'utf8')
  } catch (e) {
    return { file: filePath, ok: false, errors: [`Cannot read file: ${e.message}`], warnings: [] }
  }

  let doc
  try {
    doc = yaml.load(raw)
  } catch (e) {
    return { file: filePath, ok: false, errors: [`YAML parse error: ${e.message}`], warnings: [] }
  }

  if (typeof doc !== 'object' || doc === null) {
    return { file: filePath, ok: false, errors: ['File must be a YAML object at root level.'], warnings: [] }
  }

  // If kind is missing from doc, try to infer from file extension
  const extKind = detectKindFromExtension(filePath)
  if (extKind && !doc.meta?.kind && !doc.kind) {
    const warnings = [`Kind inferred from file extension as "${extKind}". Add meta.kind or kind field to be explicit.`]
    if (doc.meta) doc.meta.kind = extKind
    else if (!doc.kind) doc.kind = extKind
    const result = validate(doc)
    return { file: filePath, ...result, warnings: [...warnings, ...(result.warnings ?? [])] }
  }

  const result = validate(doc)
  return { file: filePath, ...result }
}
