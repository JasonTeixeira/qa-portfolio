import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { REQUIRED_SECTIONS, type SprintIntensity } from '../../lib/academy/engine'
import {
  loadFlagshipCompetencyGraph,
  validateFlagshipCompetencyGraph,
} from '../../lib/academy/flagship-competency-graph'

const registry = JSON.parse(readFileSync('data/academy/registry.json', 'utf8'))

const flagshipFoundationCourses = {
  'programming-fundamentals': 18,
  'career-engineering_judgment_foundation': 16,
  'python-basics': 12,
  'git-the-terminal': 20,
} as const

test('flagship competency graph is a complete, acyclic novice-to-mastery contract', () => {
  const graph = loadFlagshipCompetencyGraph(process.cwd())
  const result = validateFlagshipCompetencyGraph(graph, registry)

  assert.deepEqual(result.errors, [])
  assert.deepEqual(
    graph.levels.map((level) => level.id),
    ['novice', 'foundation', 'practitioner', 'advanced', 'mastery'],
  )
  assert.equal(graph.phases.at(-1)?.id, 'production-capstone')
  assert(graph.phases.every((phase) => phase.competencyIds.length > 0))
  assert(graph.competencies.every((competency) => competency.evidence.length >= 3))
})

test('mastery requires independent build, debugging, explanation, transfer, and spaced retrieval', () => {
  const graph = loadFlagshipCompetencyGraph(process.cwd())
  const evidenceTypes = new Set(
    graph.masteryPolicy.requiredEvidence.map((requirement) => requirement.type),
  )

  for (const required of ['build', 'debug', 'explain', 'transfer', 'retrieve'] as const) {
    assert(evidenceTypes.has(required), `missing mastery evidence type: ${required}`)
  }
  assert.deepEqual(graph.masteryPolicy.retrievalScheduleDays, [2, 7, 21, 45])
  assert.equal(graph.masteryPolicy.labEvidenceBeforeTrustedRuntime, 'practice_only')
  assert.match(graph.masteryPolicy.outcomeDisclaimer, /does not guarantee.*percentile/i)
})

test('every flagship course and mapped lesson resolves to the canonical registry', () => {
  const graph = loadFlagshipCompetencyGraph(process.cwd())
  const result = validateFlagshipCompetencyGraph(graph, registry)

  assert.deepEqual(result.missingCourseSlugs, [])
  assert.deepEqual(result.missingLessonKeys, [])
  assert(result.referencedCourseSlugs.includes('programming-fundamentals'))
  assert(result.referencedCourseSlugs.includes('career-cloud_devops_operations'))
  assert(result.referencedCourseSlugs.includes('career-ai_engineering_rag_eval'))
})

test('broken flagship graphs fail closed on cycles, orphans, and invented mappings', () => {
  const graph = structuredClone(loadFlagshipCompetencyGraph(process.cwd()))
  graph.phases[0].competencyIds = []
  graph.phases[1].prerequisitePhaseIds = ['production-capstone']
  graph.competencies[0].courseMappings = [{ courseSlug: 'invented-course' }]
  graph.competencies[1].courseMappings[0].lessonSlugs = ['invented-lesson']

  const result = validateFlagshipCompetencyGraph(graph, registry)

  assert(result.errors.some((error) => /has no competencies/.test(error)))
  assert(result.errors.some((error) => /dependency cycle/.test(error)))
  assert(result.errors.some((error) => /not assigned to a phase/.test(error)))
  assert.deepEqual(result.missingCourseSlugs, ['invented-course'])
  assert.deepEqual(result.missingLessonKeys, [
    'career-engineering_judgment_foundation/invented-lesson',
  ])
})

test('every flagship foundation course implements its declared learning loop with proof gates', () => {
  for (const [courseSlug, expectedLessons] of Object.entries(flagshipFoundationCourses)) {
    const lessons = JSON.parse(
      readFileSync(`data/academy/authoring/${courseSlug}.lessons.json`, 'utf8'),
    ) as Record<string, Array<Record<string, unknown>>>

    assert.equal(Object.keys(lessons).length, expectedLessons, `${courseSlug}: lesson count drift`)
    for (const [lessonSlug, blocks] of Object.entries(lessons)) {
      const key = `${courseSlug}/${lessonSlug}`
      const contract = blocks.find((block) => block.type === 'sprint-contract')
      assert(contract, `${key}: missing sprint contract`)
      const intensity = contract.intensity as SprintIntensity
      const blockTypes = blocks.map((block) => block.type)

      for (const required of REQUIRED_SECTIONS[intensity]) {
        assert(blockTypes.includes(required), `${key}: missing ${required}`)
      }

      const gate = blocks.find((block) => block.type === 'unlock-gate')
      assert(Array.isArray(gate?.criteria) && gate.criteria.length >= 3, `${key}: weak unlock gate`)
      assert(
        (gate.criteria as string[]).some((criterion) => /test|prove|output|evidence|demonstrate/i.test(criterion)),
        `${key}: unlock gate lacks observable proof`,
      )
    }
  }
})

test('Python Basics fulfills the public 12-lesson promise with production-practical coverage', () => {
  const lessons = JSON.parse(
    readFileSync('data/academy/authoring/python-basics.lessons.json', 'utf8'),
  ) as Record<string, unknown>

  assert.deepEqual(Object.keys(lessons), [
    'your-first-line',
    'variables',
    'logic-conditionals',
    'loops',
    'functions-and-scope',
    'collections',
    'exceptions-validation',
    'files-json',
    'modules-venvs',
    'testing-debugging',
    'http-apis',
    'automation-capstone',
  ])
})

test('every Engineering Judgment lesson produces an executable artifact with a reference implementation', () => {
  const lessons = JSON.parse(
    readFileSync('data/academy/authoring/career-engineering_judgment_foundation.lessons.json', 'utf8'),
  ) as Record<string, Array<Record<string, unknown>>>
  const solutions = JSON.parse(
    readFileSync('data/academy/authoring/career-engineering_judgment_foundation.lab_solutions.json', 'utf8'),
  ) as Record<string, { language?: string; code?: string }>

  for (const [slug, blocks] of Object.entries(lessons)) {
    const lab = blocks.find((block) => block.type === 'lab')
    assert(lab, `${slug}: missing executable lab`)
    assert.equal(typeof lab.starter, 'string', `${slug}: missing lab starter`)
    assert.equal(typeof lab.check, 'string', `${slug}: missing observable lab check`)
    assert.equal(solutions[slug]?.language, lab.language, `${slug}: solution language mismatch`)
    assert((solutions[slug]?.code?.length ?? 0) > 40, `${slug}: missing substantive solution`)
  }
})

test('mastery-loop remediation preserves every pre-existing lab block identity', () => {
  const expectedIndexes: Record<string, Record<string, number>> = {
    'career-engineering_judgment_foundation': {
      '05-tiny-artifact': 9,
      '06-failure-injection': 9,
      '07-tradeoff-decision': 10,
      '08-testa-proof': 9,
      '09-explain-back': 9,
      '10-review-rubric': 9,
      '11-repair-loop': 9,
      '12-spacing-queue': 9,
    },
    'python-basics': {
      'your-first-line': 9,
      variables: 9,
      'logic-conditionals': 9,
      loops: 9,
    },
    'git-the-terminal': Object.fromEntries(
      registry.courses
        .find((course: { slug: string }) => course.slug === 'git-the-terminal')
        .lessons.map((lesson: { slug: string }) => [lesson.slug, 7]),
    ),
  }

  for (const [courseSlug, lessonIndexes] of Object.entries(expectedIndexes)) {
    const lessons = JSON.parse(
      readFileSync(`data/academy/authoring/${courseSlug}.lessons.json`, 'utf8'),
    ) as Record<string, Array<Record<string, unknown>>>
    for (const [lessonSlug, expectedIndex] of Object.entries(lessonIndexes)) {
      assert.equal(
        lessons[lessonSlug].findIndex((block) => block.type === 'lab'),
        expectedIndex,
        `${courseSlug}/${lessonSlug}: lab block identity changed`,
      )
    }
  }
})
