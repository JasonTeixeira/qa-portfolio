/**
 * Audit harness for the 8-course handoff (see
 * ~/AI_CAREER_OPERATING_SYSTEM/HANDOFF_8_COURSES/HANDOFF_INSTRUCTIONS.txt, Section I).
 *
 * Takes a directory of returned course folders — each with
 *   <slug>.lessons.json   ({ lessonSlug: LessonBlock[] })
 *   <slug>.manifest.json   ([{ courseSlug, slug, title, moduleTitle, moduleSort, sort, sourceMdPath }])
 *   <slug>.sources.json    ([{ title, organization, url, source_tier, retrieved_at, excerpt, keywords }])
 * — and runs the return-check automatically:
 *
 *   1. Block schema           reuses the LIVE validateBlocks() (same gate as apply-course).
 *   2. Diagram edge refs       validateBlocks() rejects any edge → unknown node (+ storyboard refs).
 *   3. Sprint arc (pedagogy)   all 14 standard required sections present, in canonical order.
 *   4. One diagram / one quiz  exactly one diagram + at least one quiz per lesson.
 *   5. Labs (executable)       runs each lab's `solution` (python/sql/js) and byte-diffs stdout vs `check`.
 *   6. Manifest               one entry per lesson; slugs match lessons.json both ways; fields present.
 *   7. Sources                 structural check of every source row; surfaces tier-1 coverage.
 *
 * A course PASSES the gate iff: 0 schema errors, 0 ref errors, 0 missing/out-of-order
 * sprint sections, every lab that ships a `solution` runs and matches its `check`, and
 * the manifest is 1:1 with the lessons. Labs without a `solution`, and every source row,
 * are surfaced as WARN (needs a human/AI eye) — never silently passed.
 *
 * Usage:
 *   npx tsx scripts/academy/authoring/audit-courses.ts <dir> [--course <slug>] [--no-run-labs] [--no-content-heuristics] [--json <out.json>]
 *   npx tsx scripts/academy/authoring/audit-courses.ts --self-test
 *
 * Beyond structure, it runs anti-template CONTENT heuristics (FAIL-level): boilerplate
 * reuse across lessons (commonMistake/tradeoff/quiz/diagram), templated concept blocks
 * (high cross-lesson similarity), and hollow labs whose output is a hardcoded proof card.
 * These catch procedurally-generated shells that pass every structural check but don't
 * teach. Pass --no-content-heuristics to run structure-only.
 *
 * SAFETY: this EXECUTES lab code authored by the external AI (python3/node/sqlite3),
 * each under a hard timeout. Run it only on course bundles you commissioned. Pass
 * --no-run-labs for a structure-only pass that never executes anything.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, statSync, mkdtempSync, rmSync } from 'node:fs'
import { join, basename } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { validateBlocks, countVisualBlocks } from '@/lib/academy/validate-blocks'
import type { LessonBlock } from '@/data/academy/sample-course'
import { REQUIRED_SECTIONS } from '@/lib/academy/engine'

const LAB_TIMEOUT_MS = 10_000
const REQUIRED = REQUIRED_SECTIONS.standard

// ── tiny report model ────────────────────────────────────────────────────────
type Sev = 'FAIL' | 'WARN' | 'PASS'
interface Finding {
  lesson: string
  dim: string
  sev: Sev
  msg: string
}
interface CourseReport {
  course: string
  lessons: number
  findings: Finding[]
  gate: 'PASS' | 'FAIL'
  counts: { fail: number; warn: number; labsRun: number; labsPass: number; labsUnverified: number }
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

// ── lab runners (offline) ────────────────────────────────────────────────────
// Each returns { ok, stdout, err } after running the reference solution.
type RunResult = { ran: boolean; stdout: string; err?: string }

function runPython(source: string, stdin: string | undefined): RunResult {
  const r = spawnSync('python3', ['-I', '-c', source], {
    input: stdin ?? '',
    encoding: 'utf8',
    timeout: LAB_TIMEOUT_MS,
  })
  if (r.error) return { ran: false, stdout: '', err: String(r.error.message ?? r.error) }
  if (r.status !== 0) return { ran: false, stdout: r.stdout ?? '', err: (r.stderr || '').trim() }
  return { ran: true, stdout: r.stdout ?? '' }
}

// Shell labs (e.g. the git/terminal course) — run the reference bash script in a
// throwaway temp cwd so filesystem side effects don't leak. Deterministic output only.
function runShell(source: string, stdin: string | undefined): RunResult {
  const dir = mkdtempSync(join(tmpdir(), 'shaudit-'))
  try {
    const r = spawnSync('bash', ['-c', source], {
      input: stdin ?? '',
      cwd: dir,
      encoding: 'utf8',
      timeout: LAB_TIMEOUT_MS,
      env: { ...process.env, LANG: 'C', LC_ALL: 'C' },
    })
    if (r.error) return { ran: false, stdout: '', err: String(r.error.message ?? r.error) }
    if (r.status !== 0) return { ran: false, stdout: r.stdout ?? '', err: (r.stderr || '').trim() }
    return { ran: true, stdout: r.stdout ?? '' }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

// Emulate the documented JS lab runtime: console.log(...args) → args space-joined,
// objects JSON.stringified. We shim console.log, then run the solution as ESM.
function runJs(source: string): RunResult {
  const shim =
    `const __out=[];const __fmt=(a)=>typeof a==='object'&&a!==null?JSON.stringify(a):String(a);` +
    `console.log=(...a)=>{__out.push(a.map(__fmt).join(' '))};` +
    `globalThis.__done=()=>process.stdout.write(__out.join('\\n'));`
  const wrapped = `${shim}\ntry{\n${source}\n}finally{globalThis.__done()}`
  const r = spawnSync('node', ['--input-type=module', '-e', wrapped], {
    encoding: 'utf8',
    timeout: LAB_TIMEOUT_MS,
  })
  if (r.error) return { ran: false, stdout: '', err: String(r.error.message ?? r.error) }
  if (r.status !== 0) return { ran: false, stdout: r.stdout ?? '', err: (r.stderr || '').trim() }
  return { ran: true, stdout: r.stdout ?? '' }
}

// Run the SQL script vs a fresh in-memory SQLite with headers on + " | " separator,
// matching the handoff runtime contract for `check`.
function runSql(source: string): RunResult {
  const dir = mkdtempSync(join(tmpdir(), 'sqlaudit-'))
  const script = join(dir, 's.sql')
  try {
    writeFileSync(script, `.headers on\n.mode list\n.separator " | "\n${source}\n`)
    const r = spawnSync('sqlite3', [':memory:'], {
      input: readFileSync(script, 'utf8'),
      encoding: 'utf8',
      timeout: LAB_TIMEOUT_MS,
    })
    if (r.error) return { ran: false, stdout: '', err: String(r.error.message ?? r.error) }
    if (r.status !== 0) return { ran: false, stdout: r.stdout ?? '', err: (r.stderr || '').trim() }
    return { ran: true, stdout: r.stdout ?? '' }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const norm = (s: string) => s.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n+$/, '')

// ── content-substance heuristics (anti-template) ─────────────────────────────
// These catch procedurally-generated shells that pass the structural gate: the
// same sentence skeleton reused across every lesson with the topic noun swapped,
// boilerplate tradeoffs/quizzes, one generic diagram, and labs that print a
// hardcoded "proof card" instead of computing anything. Real, distinct teaching
// content scores far from these thresholds; a template collapses toward them.
function shingles(text: string, n = 4): Set<string> {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean)
  const s = new Set<string>()
  for (let i = 0; i + n <= words.length; i++) s.add(words.slice(i, i + n).join(' '))
  return s
}
function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  return inter / (a.size + b.size - inter)
}
function median(xs: number[]): number {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
function stringLiterals(src: string): string {
  const out: string[] = []
  const re = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|`([^`\\]*(?:\\.[^`\\]*)*)`/g
  let m: RegExpExecArray | null
  while ((m = re.exec(src))) out.push((m[1] ?? m[2] ?? m[3] ?? '').replace(/\\n/g, '\n'))
  return out.join('\n')
}

const SIM_THRESHOLD = 0.4 // concept cross-lesson similarity above this = templated
const REUSE_MIN_UNIQUE_RATIO = 0.5 // fewer unique values than this = boilerplate
const LAB_HARDCODE_FRAC = 0.85 // this share of check lines present verbatim in solution = computes nothing

function contentHeuristics(
  lessonsDoc: Record<string, unknown>,
  solutions: Record<string, SolutionEntry>,
): Finding[] {
  const F: Finding[] = []
  const lessons = Object.keys(lessonsDoc)
  const first = (slug: string, type: string) =>
    (Array.isArray(lessonsDoc[slug]) ? (lessonsDoc[slug] as unknown[]) : [])
      .filter(isRecord)
      .find((b) => b.type === type)

  // 1. Boilerplate reuse — one value repeated across most lessons.
  const gather = (type: string, field: string) =>
    lessons.map((s) => { const b = first(s, type); return b && typeof b[field] === 'string' ? (b[field] as string) : null }).filter((x): x is string => !!x)
  const flagReuse = (name: string, arr: string[]) => {
    if (arr.length < 5) return
    const uniq = new Set(arr).size
    if (uniq / arr.length < REUSE_MIN_UNIQUE_RATIO)
      F.push({ lesson: '—', dim: 'template', sev: 'FAIL', msg: `${name}: only ${uniq} unique across ${arr.length} lessons (${Math.round((uniq / arr.length) * 100)}%) — boilerplate, not per-lesson content` })
  }
  flagReuse('worked-example commonMistake', gather('worked-example', 'commonMistake'))
  flagReuse('tradeoff guidance', gather('tradeoff', 'guidance'))
  flagReuse('quiz question', gather('quiz', 'question'))
  const diagSigs = lessons.map((s) => { const d = first(s, 'diagram'); return d && Array.isArray(d.nodes) ? (d.nodes as unknown[]).filter(isRecord).map((n) => String(n.label)).sort().join('|') : null }).filter((x): x is string => !!x)
  flagReuse('diagram structure (node set)', diagSigs)

  // 2. Concept templating — high median pairwise similarity across lessons.
  const concepts = gather('concept', 'text')
  if (concepts.length >= 5) {
    const sh = concepts.map((c) => shingles(c))
    const sims: number[] = []
    for (let i = 0; i < sh.length; i++) for (let j = i + 1; j < sh.length; j++) sims.push(jaccard(sh[i], sh[j]))
    const med = median(sims)
    if (med > SIM_THRESHOLD)
      F.push({ lesson: '—', dim: 'template', sev: 'FAIL', msg: `concept blocks are templated: median cross-lesson similarity ${Math.round(med * 100)}% (genuinely distinct teaching runs <20%)` })
  }

  // 3. Lab substance — output reconstructable from the solution's string literals
  //    means the lab prints a hardcoded proof card and computes nothing.
  for (const s of lessons) {
    const lab = first(s, 'lab')
    if (!lab) continue
    const checkStr = typeof lab.check === 'string' ? lab.check : ''
    const sol = (solutions[s] && typeof solutions[s].code === 'string' ? solutions[s].code : '') || (typeof lab.solution === 'string' ? lab.solution : '')
    if (!checkStr || !sol) continue
    const lits = stringLiterals(sol)
    const lines = norm(checkStr).split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length < 2) continue
    const covered = lines.filter((l) => lits.includes(l)).length
    const frac = covered / lines.length
    if (frac >= LAB_HARDCODE_FRAC)
      F.push({ lesson: s, dim: 'lab-substance', sev: 'FAIL', msg: `lab output is hardcoded — ${Math.round(frac * 100)}% of check lines appear verbatim as string literals in the solution; the lab computes nothing (proof-card pattern)` })
  }

  return F
}

// ── per-lesson checks ────────────────────────────────────────────────────────
type SolutionEntry = { language?: string; code?: string; stdin?: string }

function auditLesson(
  lessonSlug: string,
  blocksRaw: unknown,
  solutions: Record<string, SolutionEntry>,
  runLabs: boolean,
  counts: CourseReport['counts'],
): Finding[] {
  const f: Finding[] = []
  const push = (dim: string, sev: Sev, msg: string) => f.push({ lesson: lessonSlug, dim, sev, msg })

  if (!Array.isArray(blocksRaw)) {
    push('schema', 'FAIL', 'lesson value is not an array of blocks')
    return f
  }

  // 1 + 2. LIVE validator: block schema + diagram/storyboard ref integrity.
  const res = validateBlocks(blocksRaw)
  if (!res.ok) {
    for (const e of res.errors) push('schema', 'FAIL', e)
    // schema failed — the block list may be untrustworthy; still do structural counts.
  }
  const blocks = (Array.isArray(blocksRaw) ? blocksRaw : []).filter(isRecord) as Array<Record<string, unknown>>
  const types = blocks.map((b) => String(b.type))

  // 3. Sprint arc — every required section present, in canonical order.
  const missing = REQUIRED.filter((s) => !types.includes(s))
  if (missing.length) push('sprint-arc', 'FAIL', `missing required sections: ${missing.join(', ')}`)
  // order: the required types, in the order they appear, must match canonical order.
  const seq = types.filter((t) => REQUIRED.includes(t))
  const canonical = REQUIRED.filter((t) => seq.includes(t))
  const seqDedup = seq.filter((t, i) => seq.indexOf(t) === i)
  if (missing.length === 0 && seqDedup.join(',') !== canonical.join(',')) {
    push('sprint-arc', 'FAIL', `required sections out of order: got [${seqDedup.join(', ')}]`)
  }

  // 4. Exactly one diagram; at least one quiz.
  const diagrams = types.filter((t) => t === 'diagram').length
  if (diagrams !== 1) push('visual', diagrams === 0 ? 'FAIL' : 'WARN', `expected exactly 1 diagram, found ${diagrams}`)
  const quizzes = types.filter((t) => t === 'quiz').length
  if (quizzes < 1) push('quiz', 'WARN', 'no quiz block in this lesson')
  if (countVisualBlocks(blocksRaw as LessonBlock[]) < 1) push('visual', 'WARN', 'no visual blocks at all')

  // 5. Labs — run the reference solution and byte-diff vs check.
  // Solution source: an inline `solution` field if present, else the external
  // lab_solutions.json entry keyed by this lesson slug (the real deliverable shape).
  const ext = solutions[lessonSlug]
  const labs = blocks.filter((b) => b.type === 'lab')
  for (const lab of labs) {
    const title = String(lab.title ?? '?')
    const check = typeof lab.check === 'string' ? lab.check : undefined
    const solution =
      (typeof lab.solution === 'string' && lab.solution) ||
      (ext && typeof ext.code === 'string' ? ext.code : undefined)
    const lang = String(lab.language ?? (ext && ext.language) ?? '')
    const stdin =
      (typeof lab.stdin === 'string' ? lab.stdin : undefined) ??
      (ext && typeof ext.stdin === 'string' ? ext.stdin : undefined)
    if (!check) { push('lab', 'FAIL', `lab "${title}" missing 'check'`); continue }
    if (!solution) {
      counts.labsUnverified++
      push('lab', 'WARN', `lab "${title}" has no solution (inline or in lab_solutions.json) — cannot auto-verify`)
      continue
    }
    if (!runLabs) { counts.labsUnverified++; push('lab', 'WARN', `lab "${title}" not run (--no-run-labs)`); continue }
    if (!['python', 'sql', 'js', 'shell'].includes(lang)) {
      counts.labsUnverified++
      push('lab', 'WARN', `lab "${title}" language '${lang}' not runnable offline`)
      continue
    }
    counts.labsRun++
    const out =
      lang === 'python' ? runPython(solution, stdin)
      : lang === 'sql' ? runSql(solution)
      : lang === 'shell' ? runShell(solution, stdin)
      : runJs(solution)
    if (!out.ran) {
      push('lab', 'FAIL', `lab "${String(lab.title ?? '?')}" (${lang}) solution errored: ${out.err ?? 'unknown'}`)
      continue
    }
    if (norm(out.stdout) === norm(check)) {
      counts.labsPass++
    } else {
      push(
        'lab',
        'FAIL',
        `lab "${String(lab.title ?? '?')}" (${lang}) output ≠ check.\n    got:    ${JSON.stringify(norm(out.stdout)).slice(0, 240)}\n    check:  ${JSON.stringify(norm(check)).slice(0, 240)}`,
      )
    }
  }

  return f
}

// ── per-course driver ────────────────────────────────────────────────────────
function findFile(dir: string, courseSlug: string, suffix: string): string | null {
  const exact = join(dir, `${courseSlug}.${suffix}`)
  if (existsSync(exact)) return exact
  const hit = readdirSync(dir).find((n) => n.endsWith(`.${suffix}`))
  return hit ? join(dir, hit) : null
}

function readJson(path: string): unknown {
  try { return JSON.parse(readFileSync(path, 'utf8')) } catch (e) { return { __parseError: String((e as Error).message) } }
}

function auditCourse(courseDir: string, runLabs: boolean, contentChecks: boolean): CourseReport {
  const course = basename(courseDir)
  const counts = { fail: 0, warn: 0, labsRun: 0, labsPass: 0, labsUnverified: 0 }
  const findings: Finding[] = []

  const lessonsPath = findFile(courseDir, course, 'lessons.json')
  if (!lessonsPath) {
    findings.push({ lesson: '—', dim: 'files', sev: 'FAIL', msg: 'no *.lessons.json found in course folder' })
    return { course, lessons: 0, findings, gate: 'FAIL', counts: { ...counts, fail: 1 } }
  }
  const lessonsDoc = readJson(lessonsPath)
  if (!isRecord(lessonsDoc)) {
    findings.push({ lesson: '—', dim: 'files', sev: 'FAIL', msg: `${basename(lessonsPath)} is not a JSON object of {slug: blocks[]}` })
    return { course, lessons: 0, findings, gate: 'FAIL', counts: { ...counts, fail: 1 } }
  }
  const lessonSlugs = Object.keys(lessonsDoc)

  // External reference solutions: <slug>.lab_solutions.json = { lessonSlug: {language, code, stdin?} }.
  const solutionsPath = findFile(courseDir, course, 'lab_solutions.json')
  let solutions: Record<string, SolutionEntry> = {}
  if (solutionsPath) {
    const doc = readJson(solutionsPath)
    if (isRecord(doc)) solutions = doc as Record<string, SolutionEntry>
    else findings.push({ lesson: '—', dim: 'lab', sev: 'WARN', msg: 'lab_solutions.json is not an object of {slug: {language, code}}' })
  } else {
    findings.push({ lesson: '—', dim: 'lab', sev: 'WARN', msg: 'no *.lab_solutions.json — labs can only be auto-verified from inline solutions' })
  }

  for (const slug of lessonSlugs) {
    findings.push(...auditLesson(slug, lessonsDoc[slug], solutions, runLabs, counts))
  }

  // Content-substance heuristics (anti-template) — catch procedurally-generated
  // shells that pass structure but don't actually teach.
  if (contentChecks) findings.push(...contentHeuristics(lessonsDoc, solutions))

  // 6. Manifest — 1:1 with lessons, fields present.
  const manifestPath = findFile(courseDir, course, 'manifest.json')
  if (!manifestPath) {
    findings.push({ lesson: '—', dim: 'manifest', sev: 'FAIL', msg: 'no *.manifest.json found' })
  } else {
    const man = readJson(manifestPath)
    if (!Array.isArray(man)) {
      findings.push({ lesson: '—', dim: 'manifest', sev: 'FAIL', msg: 'manifest is not an array' })
    } else {
      const manSlugs = new Set<string>()
      man.forEach((e, i) => {
        if (!isRecord(e)) { findings.push({ lesson: `manifest[${i}]`, dim: 'manifest', sev: 'FAIL', msg: 'entry not an object' }); return }
        for (const k of ['courseSlug', 'slug', 'title', 'moduleTitle', 'sort']) {
          if (e[k] === undefined || e[k] === null || e[k] === '') findings.push({ lesson: `manifest[${i}]`, dim: 'manifest', sev: 'FAIL', msg: `entry missing '${k}'` })
        }
        if (typeof e.slug === 'string') manSlugs.add(e.slug)
      })
      for (const s of lessonSlugs) if (!manSlugs.has(s)) findings.push({ lesson: s, dim: 'manifest', sev: 'FAIL', msg: 'lesson has no manifest entry' })
      for (const s of manSlugs) if (!lessonSlugs.includes(s)) findings.push({ lesson: s, dim: 'manifest', sev: 'FAIL', msg: 'manifest entry has no matching lesson' })
    }
  }

  // 7. Sources — structural check + tier-1 coverage (WARN-level; content truth is a human/AI spot-check).
  const sourcesPath = findFile(courseDir, course, 'sources.json')
  if (!sourcesPath) {
    findings.push({ lesson: '—', dim: 'sources', sev: 'WARN', msg: 'no *.sources.json found — load-bearing claims are unsourced' })
  } else {
    const src = readJson(sourcesPath)
    if (!Array.isArray(src)) {
      findings.push({ lesson: '—', dim: 'sources', sev: 'WARN', msg: 'sources.json is not an array' })
    } else {
      let tier1 = 0
      src.forEach((s, i) => {
        if (!isRecord(s)) { findings.push({ lesson: `sources[${i}]`, dim: 'sources', sev: 'WARN', msg: 'entry not an object' }); return }
        for (const k of ['title', 'organization', 'url', 'source_tier', 'excerpt']) {
          if (s[k] === undefined || s[k] === null || s[k] === '') findings.push({ lesson: `sources[${i}]`, dim: 'sources', sev: 'WARN', msg: `source missing '${k}'` })
        }
        if (typeof s.url === 'string' && !/^https?:\/\//.test(s.url)) findings.push({ lesson: `sources[${i}]`, dim: 'sources', sev: 'WARN', msg: `url not http(s): ${s.url}` })
        if (Number(s.source_tier) === 1) tier1++
      })
      findings.push({ lesson: '—', dim: 'sources', sev: 'PASS', msg: `${src.length} sources (${tier1} tier-1) — verify truth by spot-check` })
    }
  }

  counts.fail = findings.filter((x) => x.sev === 'FAIL').length
  counts.warn = findings.filter((x) => x.sev === 'WARN').length
  const gate: 'PASS' | 'FAIL' = counts.fail === 0 ? 'PASS' : 'FAIL'
  return { course, lessons: lessonSlugs.length, findings, gate, counts }
}

// ── reporting ────────────────────────────────────────────────────────────────
function printReport(reports: CourseReport[]): void {
  const C = { red: '\x1b[31m', yel: '\x1b[33m', grn: '\x1b[32m', dim: '\x1b[2m', rst: '\x1b[0m', bold: '\x1b[1m' }
  for (const r of reports) {
    const badge = r.gate === 'PASS' ? `${C.grn}PASS${C.rst}` : `${C.red}FAIL${C.rst}`
    console.log(`\n${C.bold}▌ ${r.course}${C.rst}  [${badge}]  ${r.lessons} lessons · ${r.counts.fail} fail · ${r.counts.warn} warn · labs ${r.counts.labsPass}/${r.counts.labsRun} pass, ${r.counts.labsUnverified} unverified`)
    const fails = r.findings.filter((x) => x.sev === 'FAIL')
    const warns = r.findings.filter((x) => x.sev === 'WARN')
    for (const x of fails) console.log(`  ${C.red}✗${C.rst} [${x.dim}] ${x.lesson}: ${x.msg}`)
    for (const x of warns) console.log(`  ${C.yel}!${C.rst} ${C.dim}[${x.dim}] ${x.lesson}: ${x.msg}${C.rst}`)
    if (!fails.length && !warns.length) console.log(`  ${C.grn}✓ clean${C.rst}`)
  }
  const totFail = reports.reduce((n, r) => n + r.counts.fail, 0)
  const passed = reports.filter((r) => r.gate === 'PASS').length
  console.log(`\n${C.bold}═══ ${passed}/${reports.length} courses PASS · ${totFail} total blocking issues ═══${C.rst}`)
}

// ── self-test (no external bundle needed) ────────────────────────────────────
function selfTest(): void {
  const counts = { fail: 0, warn: 0, labsRun: 0, labsPass: 0, labsUnverified: 0 }
  // A minimal lesson: good python lab that prints 42; a bad diagram edge.
  const good = auditLesson('t-good', [
    { type: 'lab', title: 'add', language: 'python', starter: '# TODO', solution: 'print(21+21)', check: '42' },
  ], {}, true, counts)
  const labOk = counts.labsPass === 1 && !good.some((x) => x.dim === 'lab' && x.sev === 'FAIL')

  const badRefs = validateBlocks([
    { type: 'diagram', title: 'x', nodes: [{ id: 'a', label: 'A' }], edges: [{ from: 'a', to: 'ghost' }] },
  ])
  const refCaught = badRefs.ok === false && badRefs.errors.some((e) => e.includes("unknown node 'ghost'"))

  const c2 = { fail: 0, warn: 0, labsRun: 0, labsPass: 0, labsUnverified: 0 }
  const badLab = auditLesson('t-bad', [
    { type: 'lab', title: 'wrong', language: 'python', starter: '#', solution: 'print(1)', check: '2' },
  ], {}, true, c2)
  const mismatchCaught = badLab.some((x) => x.dim === 'lab' && x.sev === 'FAIL' && x.msg.includes('≠ check'))

  const sqlOk = runSql('SELECT 1 AS n;').stdout.trim() === 'n\n1'.trim() || norm(runSql('SELECT 1 AS n;').stdout) === norm('n\n1')
  const jsOk = norm(runJs("console.log('hi', {a:1})").stdout) === norm('hi {"a":1}')

  // Content heuristics: a hollow 6-lesson course (one reused commonMistake + proof-card
  // labs) must FAIL; a varied course with computed labs must stay clean.
  const mk = (i: number, hollow: boolean) => hollow
    ? [
        { type: 'worked-example', intro: 'x', steps: ['s'], commonMistake: 'Shipping a demo without a proof packet.' },
        { type: 'lab', title: 't', language: 'python', starter: '#', check: `lesson-${i}\nartifact-${i}` },
      ]
    : [
        { type: 'worked-example', intro: 'x', steps: ['s'], commonMistake: `Distinct mistake number ${i} about topic ${i}.` },
        { type: 'lab', title: 't', language: 'python', starter: '#', check: `${i * 7}\n${i * 13}` },
      ]
  const hollowDoc: Record<string, unknown> = {}, variedDoc: Record<string, unknown> = {}
  const hollowSol: Record<string, SolutionEntry> = {}, variedSol: Record<string, SolutionEntry> = {}
  for (let i = 0; i < 6; i++) {
    hollowDoc[`l${i}`] = mk(i, true); hollowSol[`l${i}`] = { language: 'python', code: `print("lesson-${i}")\nprint("artifact-${i}")` }
    variedDoc[`l${i}`] = mk(i, false); variedSol[`l${i}`] = { language: 'python', code: `print(${i}*7)\nprint(${i}*13)` }
  }
  const hollowF = contentHeuristics(hollowDoc, hollowSol)
  const variedF = contentHeuristics(variedDoc, variedSol)
  const templateCaught = hollowF.some((x) => x.dim === 'template') && hollowF.some((x) => x.dim === 'lab-substance')
  const noFalsePos = variedF.length === 0

  const all = labOk && refCaught && mismatchCaught && sqlOk && jsOk && templateCaught && noFalsePos
  console.log(`lab-pass:${labOk} ref-catch:${refCaught} mismatch-catch:${mismatchCaught} sql:${sqlOk} js:${jsOk} template-catch:${templateCaught} no-false-pos:${noFalsePos}`)
  console.log(all ? 'SELF-TEST PASS — harness runs labs, diffs check, catches bad refs + templated/hollow content.' : 'SELF-TEST FAIL')
  process.exit(all ? 0 : 1)
}

// ── main ─────────────────────────────────────────────────────────────────────
function main(): void {
  const argv = process.argv.slice(2)
  if (argv.includes('--self-test')) return selfTest()
  const dir = argv.find((a) => !a.startsWith('--'))
  if (!dir || !existsSync(dir) || !statSync(dir).isDirectory()) {
    console.error('Usage: tsx scripts/academy/authoring/audit-courses.ts <dir-of-course-folders> [--course <slug>] [--no-run-labs] [--json out.json]')
    console.error('       tsx scripts/academy/authoring/audit-courses.ts --self-test')
    process.exit(2)
  }
  const runLabs = !argv.includes('--no-run-labs')
  const contentChecks = !argv.includes('--no-content-heuristics')
  const only = argv.includes('--course') ? argv[argv.indexOf('--course') + 1] : null
  const jsonOut = argv.includes('--json') ? argv[argv.indexOf('--json') + 1] : null

  // Course folders = subdirs that contain a *.lessons.json; else treat <dir> itself as one course.
  const entries = readdirSync(dir).map((n) => join(dir, n)).filter((p) => statSync(p).isDirectory())
  let courseDirs = entries.filter((p) => readdirSync(p).some((n) => n.endsWith('.lessons.json')))
  if (courseDirs.length === 0 && readdirSync(dir).some((n) => n.endsWith('.lessons.json'))) courseDirs = [dir]
  if (only) courseDirs = courseDirs.filter((p) => basename(p) === only)
  if (courseDirs.length === 0) {
    console.error(`No course folders (with a *.lessons.json) found under ${dir}`)
    process.exit(2)
  }

  const reports = courseDirs.map((p) => auditCourse(p, runLabs, contentChecks))
  printReport(reports)
  if (jsonOut) { writeFileSync(jsonOut, JSON.stringify(reports, null, 2)); console.log(`\nwrote ${jsonOut}`) }
  process.exit(reports.every((r) => r.gate === 'PASS') ? 0 : 1)
}

main()
