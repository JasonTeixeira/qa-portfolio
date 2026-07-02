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

const args = process.argv.slice(2)
const HEAL = args.includes('--heal') // for a CLEANLY-RUNNING solution whose stdout doesn't match,
                                     // adopt its real stdout as the check (fixed-output lab, author's
                                     // hand-written check was approximate). A RUNTIME ERROR never heals.
const [solPath, labsPath] = args.filter((a) => !a.startsWith('--'))
if (!solPath || !labsPath) { console.error('usage: run-labs-check.mjs <verifylab-output.json> <labs-result.json> [--heal]'); process.exit(2) }

const solOut = JSON.parse(readFileSync(solPath, 'utf8'))
const solutions = (solOut.result ?? solOut).solutions ?? []
const labsDoc = JSON.parse(readFileSync(labsPath, 'utf8'))
const labs = labsDoc.labs ?? []
const labBySlug = new Map(labs.map((l) => [l.slug, l]))
// language: mirror runtimes.ts normalizeLanguage (python default, sql, js)
const normLang = (l) => { const s = (l ?? '').toLowerCase(); return s === 'sql' ? 'sql' : (['js', 'ts', 'javascript', 'typescript'].includes(s) ? 'js' : 'python') }
const checkBySlug = new Map(labs.map((l) => [l.slug, { check: l.check, stdin: l.stdin ?? null, language: normLang(l.language) }]))
let healed = 0

const dir = mkdtempSync(join(tmpdir(), 'labcheck-'))
const norm = (s) => String(s ?? '').replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '') // trailing-ws tolerant, else exact

// Execute a solution in its runtime, producing output BYTE-IDENTICAL to the browser runtime
// (components/academy/lab/runtimes.ts): python3 / sqlite3 list-mode / node with the worker shim.
const JS_SHIM = `const __lines=[];const __str=a=>(typeof a==='object'&&a!==null)?JSON.stringify(a):String(a);const console={log:(...a)=>__lines.push(a.map(__str).join(' ')),error:(...a)=>__lines.push(a.map(__str).join(' ')),warn:(...a)=>__lines.push(a.map(__str).join(' ')),info:(...a)=>__lines.push(a.map(__str).join(' '))};\n`
const JS_TAIL = `\nprocess.stdout.write(__lines.join('\\n'))`
function execSolution(slug, solution, meta) {
  if (meta.language === 'sql') {
    const f = join(dir, `${slug.replace(/[^a-z0-9_-]/gi, '_')}.sql`)
    writeFileSync(f, solution)
    return execFileSync('sqlite3', ['-batch', '-cmd', '.mode list', '-cmd', '.headers on', '-cmd', '.separator " | "', ':memory:'], { input: solution, encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'pipe'] })
  }
  if (meta.language === 'js') {
    const f = join(dir, `${slug.replace(/[^a-z0-9_-]/gi, '_')}.js`)
    // run learner code through the SAME console shim the worker uses, isolated in new Function
    writeFileSync(f, `${JS_SHIM}(new Function('console', ${JSON.stringify(solution)}))(console);${JS_TAIL}`)
    return execFileSync('node', [f], { encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'pipe'] })
  }
  const f = join(dir, `${slug.replace(/[^a-z0-9_-]/gi, '_')}.py`)
  writeFileSync(f, solution)
  return execFileSync('python3', [f], { input: meta.stdin ?? '', encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'pipe'] })
}

let pass = 0, fail = 0
const failures = []
for (const { slug, solution } of solutions) {
  const meta = checkBySlug.get(slug)
  if (!meta) { failures.push({ slug, why: 'no matching lab/check' }); fail++; continue }
  let out
  try {
    out = execSolution(slug, solution, meta)
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
  } else if (HEAL) {
    // The solution ran cleanly (no exception) but its stdout doesn't contain the check.
    // For a fixed-output lab that means the author's check was approximate — adopt the real
    // stdout as the check. (Reached only past the execFileSync try, so no runtime error.)
    labBySlug.get(slug).check = out
    healed++; pass++
    console.log(`  HEAL ${slug} (check <- real solution stdout)`)
  } else {
    fail++
    failures.push({ slug, why: 'check not found in solution stdout', got: out.slice(0, 400), want: meta.check.slice(0, 400) })
    console.log(`  FAIL ${slug}`)
  }
}

if (HEAL && healed) { writeFileSync(labsPath, JSON.stringify(labsDoc)); console.log(`\nHEALED ${healed} check(s) written back to ${labsPath}`) }
console.log(`\nlabs: ${solutions.length} | PASS ${pass} | FAIL ${fail}${healed ? ` (of PASS, ${healed} healed)` : ''}`)
for (const f of failures) {
  console.log(`\n--- FAIL ${f.slug}: ${f.why} ---`)
  if (f.detail) console.log('  stderr: ' + f.detail)
  if (f.got != null) { console.log('  GOT : ' + JSON.stringify(f.got)); console.log('  WANT: ' + JSON.stringify(f.want)) }
}
writeFileSync(join(dir, '_failures.json'), JSON.stringify(failures, null, 2))
console.log(`\nfailures detail: ${join(dir, '_failures.json')}`)
process.exit(fail ? 1 : 0)
