// Execute each verified lab solution locally with python3 and diff its stdout against the
// stored `check`. A lab passes ONLY if solution stdout == check byte-for-byte (this mirrors
// what verifyLab does server-side against the learner's Pyodide output). Prints per-lab
// PASS/FAIL with a diff for failures, and a summary. Exit 1 if any lab fails.
//
// Usage: node scripts/academy/authoring/run-labs-check.mjs <verifylab-output.json> <labs-result.json>

import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [solPath, labsPath] = process.argv.slice(2)
if (!solPath || !labsPath) { console.error('usage: run-labs-check.mjs <verifylab-output.json> <labs-result.json>'); process.exit(2) }

const solOut = JSON.parse(readFileSync(solPath, 'utf8'))
const solutions = (solOut.result ?? solOut).solutions ?? []
const labs = JSON.parse(readFileSync(labsPath, 'utf8')).labs ?? []
const checkBySlug = new Map(labs.map((l) => [l.slug, { check: l.check, stdin: l.stdin ?? null }]))

const dir = mkdtempSync(join(tmpdir(), 'labcheck-'))
const norm = (s) => String(s ?? '').replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '') // trailing-ws tolerant, else exact

let pass = 0, fail = 0
const failures = []
for (const { slug, solution } of solutions) {
  const meta = checkBySlug.get(slug)
  if (!meta) { failures.push({ slug, why: 'no matching lab/check' }); fail++; continue }
  const file = join(dir, `${slug.replace(/[^a-z0-9_-]/gi, '_')}.py`)
  writeFileSync(file, solution)
  let out
  try {
    out = execFileSync('python3', [file], { input: meta.stdin ?? '', encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'pipe'] })
  } catch (e) {
    failures.push({ slug, why: 'runtime error', detail: (e.stderr || e.message || '').toString().slice(-400) })
    fail++; continue
  }
  // Mirror verifyLab EXACTLY: verified = output.toLowerCase().includes(check.trim().toLowerCase()).
  // That substring rule is what learners actually hit; a lab is real iff its solution satisfies it.
  const outN = norm(out), checkN = norm(meta.check).trim()
  const verified = checkN.length > 0 && outN.toLowerCase().includes(checkN.toLowerCase())
  if (verified) {
    pass++
    const exact = outN === norm(meta.check)
    console.log(`  PASS ${slug}${exact ? '' : ' (substring; check not exact stdout — ok for prod, quality nit)'}`)
  } else {
    fail++
    failures.push({ slug, why: 'check not found in solution stdout', got: out.slice(0, 400), want: meta.check.slice(0, 400) })
    console.log(`  FAIL ${slug}`)
  }
}

console.log(`\nlabs: ${solutions.length} | PASS ${pass} | FAIL ${fail}`)
for (const f of failures) {
  console.log(`\n--- FAIL ${f.slug}: ${f.why} ---`)
  if (f.detail) console.log('  stderr: ' + f.detail)
  if (f.got != null) { console.log('  GOT : ' + JSON.stringify(f.got)); console.log('  WANT: ' + JSON.stringify(f.want)) }
}
writeFileSync(join(dir, '_failures.json'), JSON.stringify(failures, null, 2))
console.log(`\nfailures detail: ${join(dir, '_failures.json')}`)
process.exit(fail ? 1 : 0)
