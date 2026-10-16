import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { validate, validatePackCrossReferences } from './validator.js'
import { lint } from './lint.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

  test('accepts pack with AAP actions array', () => {
    const r = validate({
      kind: 'pack',
      version: '1.0.0',
      id: '@test/agent-pack',
      name: 'Agent Pack',
      primitives: [{ kind: 'playbook', ref: './playbook.flpb.yml' }],
      actions: [
        {
          name: 'search_web',
          ref: './actions/search-web.aap.json',
          descriptor_signature: 'sha256:8831d493a172e0e1a7e7effb62df05f559531b2118053000d8eab3e8caffbe66',
          side_effects: ['network'],
          on_side_effect: 'allow',
        },
      ],
    })
    assert.ok(r.ok, JSON.stringify(r.errors))
  })

  test('rejects pack action with invalid descriptor_signature', () => {
    const r = validate({
      kind: 'pack',
      version: '1.0.0',
      id: '@test/agent-pack',
      name: 'Agent Pack',
      primitives: [{ kind: 'playbook', ref: './playbook.flpb.yml' }],
      actions: [
        {
          name: 'search_web',
          ref: './actions/search-web.aap.json',
          descriptor_signature: 'invalid-sig',
        },
      ],
    })
    assert.ok(!r.ok)
  })
})

describe('validate — playbook multi-vendor step roles & cross-references', () => {
  test('accepts playbook with planner, executor, verifier roles and AAP action bindings', () => {
    const r = validate({
      meta: { uacp: '1.0.0', kind: 'playbook', id: '@test/agent-pb', version: '1.0.0' },
      steps: [
        {
          id: 'plan',
          name: 'Plan',
          role: 'planner',
          adapter: { vendor: 'anthropic', model_hint: 'claude-3-7-sonnet' },
          prompt: 'Decompose goal.',
          allowed_actions: ['search_web'],
          max_tool_turns: 4,
          on_side_effect: 'allow',
        },
        {
          id: 'execute',
          name: 'Execute',
          role: 'executor',
          depends_on: ['plan'],
          adapter: { vendor: 'google', model_hint: 'gemini-2.5-flash' },
          prompt: 'Execute {{plan}}.',
          allowed_actions: ['search_web', 'write_report'],
          max_tool_turns: 8,
          on_side_effect: 'confirm',
        },
      ],
    })
    assert.ok(r.ok, JSON.stringify(r.errors))
  })

  test('rejects playbook step with unknown depends_on step ID', () => {
    const r = validate({
      meta: { uacp: '1.0.0', kind: 'playbook', id: '@test/agent-pb', version: '1.0.0' },
      steps: [
        { id: 'plan', name: 'Plan', prompt: 'Plan' },
        { id: 'exec', name: 'Exec', prompt: 'Exec', depends_on: ['nonexistent'] },
      ],
    })
    assert.ok(!r.ok)
    assert.ok(r.errors.some(e => e.includes('nonexistent')))
  })

  test('validatePackCrossReferences catches undeclared AAP actions in playbook steps', () => {
    const packDoc = {
      kind: 'pack',
      version: '1.0.0',
      id: '@test/agent-pack',
      name: 'Agent Pack',
      primitives: [{ kind: 'playbook', ref: './playbook.flpb.yml' }],
      actions: [{ name: 'search_web', ref: './actions/search-web.aap.json' }],
    }
    const playbookDoc = {
      meta: { uacp: '1.0.0', kind: 'playbook', id: '@test/agent-pb', version: '1.0.0' },
      steps: [
        { id: 'plan', name: 'Plan', role: 'planner', prompt: 'Plan', allowed_actions: ['search_web'] },
        { id: 'exec', name: 'Exec', role: 'executor', prompt: 'Exec', allowed_actions: ['undeclared_action'] },
      ],
    }
    const res = validatePackCrossReferences(packDoc, { playbooks: [playbookDoc] })
    assert.ok(!res.ok)
    assert.ok(res.errors.some(e => e.includes('undeclared_action')))
  })

  test('lints examples/packs/vendor-agnostic-research-agent/pack.flpk.yml cleanly', () => {
    const examplePath = resolve(__dirname, '../../../examples/packs/vendor-agnostic-research-agent/pack.flpk.yml')
    const res = lint(examplePath)
    assert.ok(res.ok, JSON.stringify(res.errors))
  })

  test('validates FLP-SIG-V2 metadata and declarative MMI contribution points (commands, panels, tools)', () => {
    const r = validate({
      meta: {
        uacp: '1.0.0',
        kind: 'policy',
        id: '@acme/eu-guard',
        version: '1.1.0',
        sigVersion: 2,
        publisherCert: 'dGVzdA',
        contributes: {
          commands: [{ name: 'eu:verify', description: 'Verify EU compliance posture' }],
          panels: [{ id: 'eu-ledger', title: 'EU Audit Ledger', slot: 'inspector' }],
          tools: [{ name: 'check_residency', description: 'Check model residency' }],
        },
      },
      rules: [{ type: 'pii_block', action: 'redact', params: { categories: ['email'] } }],
    })
    assert.ok(r.ok, JSON.stringify(r.errors))
  })
})
