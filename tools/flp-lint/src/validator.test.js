import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { validate } from './validator.js'

describe('validate — policy', () => {
  test('accepts valid policy', () => {
    const r = validate({
      meta: { uacp: '1.0.0', kind: 'policy', id: '@test/redact-pii', version: '1.0.0' },
      rules: [{ type: 'pii_block', action: 'redact', params: { categories: ['email'] } }],
    })
    assert.ok(r.ok, JSON.stringify(r.errors))
  })

  test('rejects policy with no rules', () => {
    const r = validate({
      meta: { uacp: '1.0.0', kind: 'policy', id: '@test/x', version: '1.0.0' },
      rules: [],
    })
    assert.ok(!r.ok)
    assert.ok(r.errors.length > 0)
  })

  test('rejects unknown rule type', () => {
    const r = validate({
      meta: { uacp: '1.0.0', kind: 'policy', id: '@test/x', version: '1.0.0' },
      rules: [{ type: 'unknown_rule' }],
    })
    assert.ok(!r.ok)
  })
})

describe('validate — guideline', () => {
  test('accepts valid guideline', () => {
    const r = validate({
      meta: { uacp: '1.0.0', kind: 'guideline', id: '@test/be-concise', version: '1.0.0' },
      shape: { instructions: 'Be concise. Use plain language.' },
    })
    assert.ok(r.ok, JSON.stringify(r.errors))
  })

  test('rejects guideline with missing shape', () => {
    const r = validate({
      meta: { uacp: '1.0.0', kind: 'guideline', id: '@test/x', version: '1.0.0' },
    })
    assert.ok(!r.ok)
  })
})

describe('validate — intent', () => {
  test('accepts valid intent', () => {
    const r = validate({
      meta: { uacp: '1.0.0', kind: 'intent', id: '@test/code-review', version: '1.0.0' },
      trigger: { mode: 'intent', patterns: ['review code'] },
      prompt: 'Review this code.',
    })
    assert.ok(r.ok, JSON.stringify(r.errors))
  })

  test('rejects invalid trigger mode', () => {
    const r = validate({
      meta: { uacp: '1.0.0', kind: 'intent', id: '@test/x', version: '1.0.0' },
      trigger: { mode: 'magic' },
    })
    assert.ok(!r.ok)
  })
})

describe('validate — strategy', () => {
  test('accepts valid strategy', () => {
    const r = validate({
      meta: { uacp: '1.0.0', kind: 'strategy', id: '@test/cheap', version: '1.0.0' },
      graph: {
        nodes: [{ id: 'a', op: 'generate', adapter: { vendor: 'anthropic' } }],
        output: 'a',
      },
    })
    assert.ok(r.ok, JSON.stringify(r.errors))
  })

  test('rejects empty nodes array', () => {
    const r = validate({
      meta: { uacp: '1.0.0', kind: 'strategy', id: '@test/x', version: '1.0.0' },
      graph: { nodes: [], output: 'a' },
    })
    assert.ok(!r.ok)
  })
})

describe('validate — template', () => {
  test('accepts valid template', () => {
    const r = validate({
      kind: 'template', version: 1, id: 'minimal', name: 'Minimal',
      layout: { sidebar: 'hidden' },
    })
    assert.ok(r.ok, JSON.stringify(r.errors))
  })

  test('rejects template with wrong version', () => {
    const r = validate({ kind: 'template', version: 2, id: 'x', name: 'X' })
    assert.ok(!r.ok)
  })
})

describe('validate — unknown kind', () => {
  test('rejects unknown kind', () => {
    const r = validate({ meta: { kind: 'unknown_thing' } })
    assert.ok(!r.ok)
    assert.ok(r.errors[0].includes('Unknown kind'))
  })

  test('rejects missing kind', () => {
    const r = validate({})
    assert.ok(!r.ok)
    assert.ok(r.errors[0].includes('Missing kind'))
  })
})

describe('validate — pack', () => {
  test('accepts valid pack', () => {
    const r = validate({
      kind: 'pack', version: '1.0.0', id: '@test/my-pack', name: 'My Pack',
      primitives: [{ kind: 'policy', ref: '@test/redact-pii' }],
    })
    assert.ok(r.ok, JSON.stringify(r.errors))
  })

  test('rejects pack with empty primitives', () => {
    const r = validate({
      kind: 'pack', version: '1.0.0', id: '@test/x', name: 'X',
      primitives: [],
    })
    assert.ok(!r.ok)
  })
})
