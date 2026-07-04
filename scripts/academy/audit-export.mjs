// Export a real Academy course from Supabase into the Master Course Auditor's
// input format: one markdown file per lesson (a single `# title` heading + body
// rendered from the lesson's block-JSON) plus an optional sources.json.
//
// The auditor (course_auditor/ingest.py) treats each file as a module and each
// `#{1,3}` heading as a lesson, extracts claims/labs/assessments via line markers
// (Lab:/command:/expected output:, Recall:/Socratic checkpoint:/Test:/Teach-back:),
// and source-verifies high-risk claims against sources.json. So the renderer emits
// exactly ONE `#`-`###` heading per file (the lesson title) and uses `####`/bold for
// intra-lesson structure, and maps assessment blocks to the marker lines the
// ingester recognises. Real content only — no invented claims or sources.
//
// Usage: node scripts/academy/audit-export.mjs <course-slug> [outDir]
//   default outDir: /Users/Sage/course-auditor-harness/exports/<course-slug>

import { createClient } from '@supabase/supabase-js'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { config } from 'dotenv'

config({ path: '.env.local' })

const [courseSlug, outArg] = process.argv.slice(2)
if (!courseSlug) {
  console.error('usage: audit-export.mjs <course-slug> [outDir]')
  process.exit(2)
}
const OUT = outArg || `/Users/Sage/course-auditor-harness/exports/${courseSlug}`

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Strip any leading #/##/### so intra-lesson block titles never fragment a lesson
// into extra "lesson" records; downgrade to h4 (####), which the ingester ignores.
const safeHeading = (s) => `#### ${String(s ?? '').replace(/^#{1,6}\s*/, '').trim()}`
const para = (s) => String(s ?? '').replace(/\r/g, '').trim()
// Flatten ANY value to readable prose — never leak raw JSON into a claim. Objects
// become "label: text" (the common {label,text}/{note}/{title} shapes), arrays join.
const flatten = (v) => {
  if (v == null) return ''
  if (typeof v === 'string') return para(v)
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) return v.map(flatten).filter(Boolean).join(' — ')
  if (typeof v === 'object') {
    const parts = []
    for (const k of ['label', 'title', 'name', 'note', 'text', 'body', 'value', 'summary', 'caption']) {
      if (v[k] != null && v[k] !== '') parts.push(flatten(v[k]))
    }
    return parts.length ? parts.join(': ') : ''
  }
  return ''
}
const bullets = (arr) => (Array.isArray(arr) ? arr.map((x) => `- ${flatten(x)}`).filter((l) => l !== '- ').join('\n') : '')

/** Render one lesson's ordered blocks to markdown body (no #-### headings). */
function renderBlocks(blocks) {
  const out = []
  for (const b of blocks ?? []) {
    switch (b.type) {
      case 'sprint-contract':
        out.push(safeHeading('Sprint contract'))
        if (b.outcome) out.push(`**Outcome:** ${para(b.outcome)}`)
        if (b.proof) out.push(`**Proof required:** ${para(b.proof)}`)
        if (b.unlock) out.push(`**Unlock standard:** ${para(b.unlock)}`)
        if (b.doNotClaim) out.push(`**Do not claim after reading:** ${para(b.doNotClaim)}`)
        break
      case 'mission':
      case 'context':
      case 'transfer':
        if (b.title) out.push(safeHeading(b.title))
        out.push(para(b.text))
        break
      case 'concept':
        if (b.title) out.push(safeHeading(b.title))
        out.push(para(b.text))
        break
      case 'pretest':
        // Pretest prompt = a Socratic checkpoint; the reveal is the model answer.
        if (b.prompt) out.push(`Socratic checkpoint: ${para(b.prompt)}`)
        if (b.reveal) out.push(para(b.reveal))
        break
      case 'diagram': {
        if (b.title) out.push(safeHeading(b.title))
        if (b.subtitle) out.push(para(b.subtitle))
        const nodes = Array.isArray(b.nodes) ? b.nodes.map((n) => n.label ?? n.id).filter(Boolean) : []
        if (nodes.length) out.push(`Diagram concepts: ${nodes.join(' · ')}`)
        break
      }
      case 'code-walkthrough': {
        if (b.title) out.push(safeHeading(b.title))
        if (b.subtitle) out.push(para(b.subtitle))
        const lang = b.language || ''
        if (b.code) out.push('```' + lang + '\n' + para(b.code) + '\n```')
        if (Array.isArray(b.steps) && b.steps.length) out.push(bullets(b.steps))
        break
      }
      case 'callout':
        out.push(`> ${para(b.text)}`)
        break
      case 'quiz':
        // Quiz question = a "test" assessment the ingester extracts.
        if (b.question) out.push(`Test: ${para(b.question)}`)
        if (Array.isArray(b.options)) out.push(bullets(b.options))
        if (b.explanation) out.push(para(b.explanation))
        break
      case 'compare': {
        if (b.title) out.push(safeHeading(b.title))
        const side = (s) => (s && (s.label || s.text) ? `**${para(s.label)}** — ${para(s.text)}` : '')
        if (b.left) out.push(side(b.left))
        if (b.right) out.push(side(b.right))
        if (b.caption) out.push(para(b.caption))
        break
      }
      case 'verification':
        // Verification proof items = recall assessment + the proof checklist.
        if (b.intro) out.push(`Recall: ${para(b.intro)}`)
        if (Array.isArray(b.items)) out.push(bullets(b.items))
        break
      case 'teachback':
        for (const p of b.prompts ?? []) out.push(`Teach-back: ${para(p)}`)
        break
      case 'spaced-review':
        if (Array.isArray(b.schedule) && b.schedule.length) out.push(`Spaced review: ${b.schedule.join(', ')}`)
        break
      default:
        if (typeof b.text === 'string') out.push(para(b.text))
    }
  }
  return out.filter(Boolean).join('\n\n')
}

async function main() {
  const { data: course, error: cErr } = await sb
    .from('academy_courses')
    .select('slug, title, topic, level')
    .eq('slug', courseSlug)
    .maybeSingle()
  if (cErr || !course) {
    console.error(`course not found: ${courseSlug}${cErr ? ' — ' + cErr.message : ''}`)
    process.exit(1)
  }
  const { data: lessons, error: lErr } = await sb
    .from('academy_lessons')
    .select('slug, title, eyebrow, module_title, module_sort, sort, blocks')
    .eq('course_slug', courseSlug)
    .order('module_sort', { ascending: true })
    .order('sort', { ascending: true })
  if (lErr) {
    console.error('lessons query failed: ' + lErr.message)
    process.exit(1)
  }
  if (!lessons?.length) {
    console.error(`no lessons for ${courseSlug} (this course has 0 authored lessons)`)
    process.exit(1)
  }

  rmSync(OUT, { recursive: true, force: true })
  mkdirSync(OUT, { recursive: true })

  let written = 0
  lessons.forEach((l, i) => {
    const ms = String(l.module_sort ?? 0).padStart(2, '0')
    const ls = String(l.sort ?? i).padStart(2, '0')
    const name = `m${ms}-l${ls}-${l.slug}.md`
    const head = `# ${para(l.title) || l.slug}\n`
    const eyebrow = l.eyebrow ? `*${para(l.eyebrow)}*\n` : ''
    const modtag = l.module_title ? `*${para(l.module_title)}*\n` : ''
    const body = renderBlocks(l.blocks)
    writeFileSync(`${OUT}/${name}`, `${head}${eyebrow}${modtag}\n${body}\n`, 'utf8')
    written++
  })

  // No structured per-lesson source ledger exists in the Academy schema yet, so we
  // emit an EMPTY sources.json. This is honest: the auditor will (correctly) block
  // unsupported high-risk claims — that missing-source signal is the point.
  writeFileSync(`${OUT}/sources.json`, '[]\n', 'utf8')

  console.log(JSON.stringify({ course: course.slug, title: course.title, lessons: written, outDir: OUT, sources: 0 }, null, 2))
}

main().catch((e) => {
  console.error('export failed: ' + (e?.message ?? e))
  process.exit(1)
})
