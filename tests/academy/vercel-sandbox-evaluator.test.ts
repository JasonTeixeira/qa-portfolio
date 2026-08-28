import assert from 'node:assert/strict'
import { Writable } from 'node:stream'
import { describe, it } from 'node:test'

import { EVALUATOR_LIMITS, type PrivateLabSpec } from '../../lib/academy/lab-evaluator/contract'
import { executePrivateCaseInVercelSandbox, type VercelSandboxCreate } from '../../services/academy-lab-evaluator/src/vercel-sandbox-executor'

const IMAGE = `academy-runtime@sha256:${'a'.repeat(64)}`

function spec(language: PrivateLabSpec['language'] = 'python'): PrivateLabSpec {
  return {
    schemaVersion: 1,
    labKey: 'python-basics/variables',
    language,
    specRevision: '2026-08-27.1',
    referenceSolution: 'REFERENCE-SOLUTION-MUST-STAY-PRIVATE',
    cases: [
      { id: 'happy', kind: 'happy', stdin: '21\n', expectedStdout: 'EXPECTED-OUTPUT-MUST-STAY-PRIVATE\n' },
      { id: 'negative', kind: 'negative', stdin: '-2\n', expectedStdout: '-4\n' },
    ],
  }
}

type FakeResult = {
  exitCode?: number
  stdout?: string
  stderr?: string
  error?: Error
  deleteError?: Error
}

type FakeCommand = {
  cmd: string
  args?: string[]
  timeoutMs?: number
  sudo?: boolean
  signal?: AbortSignal
  stdout?: Writable
  stderr?: Writable
}

type FakeFile = { path: string; content: string | Uint8Array; mode?: number }

function fakeFactory(result: FakeResult = {}) {
  const observed: {
    creates: unknown[]
    writes: unknown[]
    commands: unknown[]
    deletes: number
  } = { creates: [], writes: [], commands: [], deletes: 0 }

  const createSandbox: VercelSandboxCreate = async (config: unknown) => {
    observed.creates.push(config)
    return {
      async writeFiles(files: FakeFile[]) {
        observed.writes.push(files)
      },
      async runCommand(command: FakeCommand) {
        observed.commands.push(command)
        if (result.stdout) (command.stdout as Writable | undefined)?.write(result.stdout)
        if (result.stderr) (command.stderr as Writable | undefined)?.write(result.stderr)
        if (command.signal?.aborted) throw new Error('command aborted')
        if (result.error) throw result.error
        return { exitCode: result.exitCode ?? 0 }
      },
      async delete() {
        observed.deletes += 1
        if (result.deleteError) throw result.deleteError
      },
    }
  }
  return { createSandbox, observed }
}

function input(language: PrivateLabSpec['language'] = 'python') {
  const privateSpec = spec(language)
  return {
    language,
    code: language === 'javascript' ? 'console.log(42)' : language === 'sql' ? 'select 42;' : 'print(42)',
    testCase: privateSpec.cases[0],
    spec: privateSpec,
    image: IMAGE,
    requestId: '018f47a2-4b8d-7f31-8c5a-1ccf64d58b20',
  }
}

describe('Vercel Sandbox academy evaluator boundary', () => {
  it('creates an ephemeral deny-all microVM and sends no hidden answer material into it', async () => {
    const { createSandbox, observed } = fakeFactory({ stdout: '42\n' })
    const result = await executePrivateCaseInVercelSandbox(input(), { createSandbox })

    assert.equal(result.status, 'passed')
    assert.equal(result.stdout, '42\n')
    assert.deepEqual(observed.creates, [{
      image: IMAGE,
      networkPolicy: 'deny-all',
      persistent: false,
      resources: { vcpus: 1 },
      timeout: EVALUATOR_LIMITS.wallTimeMs + 2_000,
      tags: { service: 'academy-evaluator', request: '018f47a24b8d7f31' },
    }])
    assert.equal(observed.deletes, 1)

    const boundary = JSON.stringify({
      creates: observed.creates,
      writes: observed.writes,
      commands: observed.commands,
    })
    assert.equal(boundary.includes('EXPECTED-OUTPUT-MUST-STAY-PRIVATE'), false)
    assert.equal(boundary.includes('REFERENCE-SOLUTION-MUST-STAY-PRIVATE'), false)
    assert.equal(boundary.includes('SUPABASE'), false)
    assert.equal(boundary.includes('VERCEL_OIDC_TOKEN'), false)
  })

  it('uses fixed language commands while learner code and stdin travel only as files', async () => {
    for (const language of ['python', 'javascript', 'sql'] as const) {
      const { createSandbox, observed } = fakeFactory({ stdout: '42\n' })
      await executePrivateCaseInVercelSandbox(input(language), { createSandbox })

      const writes = observed.writes.flat() as Array<{ path: string; content: string | Uint8Array; mode?: number }>
      const command = observed.commands[0] as { cmd: string; args?: string[]; timeoutMs?: number; sudo?: boolean }
      assert.equal(command.cmd, 'bash')
      assert.equal(command.sudo, false)
      assert.equal(command.timeoutMs, EVALUATOR_LIMITS.wallTimeMs + 1_000)
      assert.equal(command.args?.join(' ').includes(input(language).code), false)
      assert.equal(command.args?.join(' ').includes(input(language).testCase.stdin), false)
      assert.equal(writes.some((file) => String(file.content).includes(input(language).code)), true)
      assert.equal(writes.some((file) => String(file.content).includes(input(language).testCase.stdin)), true)
    }
  })

  it('classifies timeout and memory termination without granting a pass', async () => {
    const timeout = fakeFactory({ exitCode: 124 })
    const timedOut = await executePrivateCaseInVercelSandbox(input(), { createSandbox: timeout.createSandbox })
    assert.equal(timedOut.status, 'timed_out')
    assert.equal(timeout.observed.deletes, 1)

    const memory = fakeFactory({ exitCode: 137 })
    const memoryLimited = await executePrivateCaseInVercelSandbox(input(), { createSandbox: memory.createSandbox })
    assert.equal(memoryLimited.status, 'memory_limited')
    assert.equal(memory.observed.deletes, 1)
  })

  it('aborts output bombs at the academy byte limit and always deletes the sandbox', async () => {
    const { createSandbox, observed } = fakeFactory({ stdout: 'x'.repeat(EVALUATOR_LIMITS.outputBytes + 1) })
    const result = await executePrivateCaseInVercelSandbox(input(), { createSandbox })

    assert.equal(result.status, 'output_limited')
    assert.equal(result.outputBytes, EVALUATOR_LIMITS.outputBytes + 1)
    assert.equal(observed.deletes, 1)
  })

  it('fails closed and deletes the sandbox when command execution throws', async () => {
    const { createSandbox, observed } = fakeFactory({ error: new Error('sandbox unavailable') })
    const result = await executePrivateCaseInVercelSandbox(input(), { createSandbox })

    assert.equal(result.status, 'runtime_error')
    assert.equal(observed.deletes, 1)
  })

  it('cannot pass when sandbox teardown is not confirmed', async () => {
    const { createSandbox, observed } = fakeFactory({ stdout: '42\n', deleteError: new Error('delete failed') })
    const result = await executePrivateCaseInVercelSandbox(input(), { createSandbox })

    assert.equal(result.status, 'runtime_error')
    assert.equal(observed.deletes, 1)
  })
})
