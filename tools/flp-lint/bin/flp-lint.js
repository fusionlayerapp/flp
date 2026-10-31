#!/usr/bin/env node
// flp-lint CLI — validates FLP primitive files against the published JSON schemas.
// Apache-2.0 License — Copyright 2026 FusionLayer Contributors

import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { lint } from '../src/lint.js'
import { FLP_ERROR_CATALOG, inspectFlpFile, runFlpDoctor } from '../src/errors.js'

function writeFlpOutputFile(filePath, payload, textOutput, { append = false } = {}) {
  if (!filePath) return null
  const abs = resolve(filePath)
  mkdirSync(dirname(abs), { recursive: true })
  const lower = abs.toLowerCase()
  const nl = '\n'
  if (append || lower.endsWith('.jsonl') || lower.endsWith('.ndjson')) {
    const line = JSON.stringify(payload !== undefined ? payload : { output: textOutput }) + nl
    if (append) appendFileSync(abs, line, 'utf8')
    else writeFileSync(abs, line, 'utf8')
    return abs
  }
  const content =
    lower.endsWith('.json') && payload !== undefined
      ? JSON.stringify(payload, null, 2) + nl
      : String(textOutput ?? JSON.stringify(payload, null, 2)) + (String(textOutput ?? '').endsWith(nl) ? '' : nl)
  writeFileSync(abs, content, 'utf8')
  return abs
}

function extractOption(argv, flags) {
  let value = null
  const rest = []
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    const eqFlag = flags.find((f) => token.startsWith(`${f}=`))
    if (eqFlag) {
      value = token.slice(eqFlag.length + 1)
      continue
    }
    if (flags.includes(token)) {
      if (i + 1 < argv.length) {
        value = argv[i + 1]
        i += 1
      }
      continue
    }
    rest.push(token)
  }
  return { value, rest }
}

const rawArgs = process.argv.slice(2)
const jsonMode = rawArgs.includes('--json')
const appendMode = rawArgs.includes('--append')
const stripped = rawArgs.filter((a) => a !== '--append')
const { value: outFile, rest: args } = extractOption(stripped, ['-o', '--out', '--output', '--log-file'])
const outputPath = outFile || process.env.FLP_DIAG_OUTPUT_FILE || null

if (args[0] === 'doctor' || args[0] === 'conformance') {
  const doc = runFlpDoctor()
  const textOut = jsonMode ? JSON.stringify(doc, null, 2) : `FLP Doctor: ${doc.healthy ? 'HEALTHY' : 'UNHEALTHY'}`
  console.log(textOut)
  writeFlpOutputFile(outputPath, doc, textOut, { append: appendMode })
  process.exit(doc.healthy ? 0 : 1)
}

if (args[0] === 'errors') {
  const code = args[1] && !args[1].startsWith('--') ? args[1].toUpperCase() : null
  if (code) {
    const entry = FLP_ERROR_CATALOG[code]
    if (!entry) {
      const errMsg = `Unknown code: ${code}`
      console.error(errMsg)
      writeFlpOutputFile(outputPath, { error: errMsg }, errMsg, { append: appendMode })
      process.exit(1)
    }
    const textOut = JSON.stringify(entry, null, 2)
    console.log(textOut)
    writeFlpOutputFile(outputPath, entry, textOut, { append: appendMode })
    process.exit(0)
  }
  const all = Object.values(FLP_ERROR_CATALOG)
  const textOut = JSON.stringify(all, null, 2)
  console.log(textOut)
  writeFlpOutputFile(outputPath, all, textOut, { append: appendMode })
  process.exit(0)
}

if (args[0] === 'inspect') {
  const target = args[1]
  if (!target) {
    console.error('Usage: flp-lint inspect <file> [--json] [-o|--output <file>]')
    process.exit(2)
  }
  const info = inspectFlpFile(target)
  const textOut = JSON.stringify(info, null, 2)
  console.log(textOut)
  writeFlpOutputFile(outputPath, info, textOut, { append: appendMode })
  process.exit(info.ok ? 0 : 1)
}

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
flp-lint — FusionLayer Primitive linter

Usage:
  flp-lint <file> [file2 ...]   Lint one or more .fl*.yml files
  flp-lint --version            Print version

Options:
  --json     Output results as JSON
  --no-warn  Only report errors, suppress warnings
  -h, --help This help

Exit codes:
  0   All files valid
  1   One or more validation errors
  2   Internal error (file not found, YAML parse failure)

Examples:
  flp-lint policy.flp.yml
  flp-lint examples/**/*.yml --json
`.trim())
  process.exit(0)
}

if (args.includes('--version')) {
  const { createRequire } = await import('node:module')
  const require = createRequire(import.meta.url)
  const { version } = require('../package.json')
  console.log(version)
  process.exit(0)
}

const noWarn = args.includes('--no-warn')
const files = args.filter(a => !a.startsWith('--'))

if (files.length === 0) {
  console.error('flp-lint: no files specified.')
  process.exit(2)
}

const results = files.map(f => lint(f))

if (jsonMode) {
  const textOut = JSON.stringify(results, null, 2)
  console.log(textOut)
  writeFlpOutputFile(outputPath, results, textOut, { append: appendMode })
} else {
  const plainLines = []
  for (const r of results) {
    const status = r.ok ? '\x1b[32m✔\x1b[0m' : '\x1b[31m✖\x1b[0m'
    console.log(`${status} ${r.file}`)
    plainLines.push(`${r.ok ? 'PASS' : 'FAIL'} ${r.file}`)
    for (const e of r.errors ?? []) {
      console.log(`  \x1b[31merror\x1b[0m  ${e}`)
      plainLines.push(`  error  ${e}`)
    }
    if (!noWarn) {
      for (const w of r.warnings ?? []) {
        console.log(`  \x1b[33mwarn\x1b[0m   ${w}`)
        plainLines.push(`  warn   ${w}`)
      }
    }
  }
  const passed = results.filter(r => r.ok).length
  const total = results.length
  console.log(`\n${passed}/${total} files valid`)
  plainLines.push(`${passed}/${total} files valid`)
  writeFlpOutputFile(outputPath, results, plainLines.join('\n'), { append: appendMode })
}

const hasErrors = results.some(r => !r.ok)
process.exit(hasErrors ? 1 : 0)
