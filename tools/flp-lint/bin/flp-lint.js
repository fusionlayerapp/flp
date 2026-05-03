#!/usr/bin/env node
// flp-lint CLI — validates FLP primitive files against the published JSON schemas.
// Apache-2.0 License — Copyright 2026 FusionLayer Contributors

import { lint } from '../src/lint.js'

const args = process.argv.slice(2)

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

const jsonMode = args.includes('--json')
const noWarn = args.includes('--no-warn')
const files = args.filter(a => !a.startsWith('--'))

if (files.length === 0) {
  console.error('flp-lint: no files specified.')
  process.exit(2)
}

const results = files.map(f => lint(f))

if (jsonMode) {
  console.log(JSON.stringify(results, null, 2))
} else {
  for (const r of results) {
    const status = r.ok ? '\x1b[32m✔\x1b[0m' : '\x1b[31m✖\x1b[0m'
    console.log(`${status} ${r.file}`)
    for (const e of r.errors ?? []) {
      console.log(`  \x1b[31merror\x1b[0m  ${e}`)
    }
    if (!noWarn) {
      for (const w of r.warnings ?? []) {
        console.log(`  \x1b[33mwarn\x1b[0m   ${w}`)
      }
    }
  }
  const passed = results.filter(r => r.ok).length
  const total = results.length
  console.log(`\n${passed}/${total} files valid`)
}

const hasErrors = results.some(r => !r.ok)
process.exit(hasErrors ? 1 : 0)
