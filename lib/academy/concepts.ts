import manifest from './concepts-manifest.json'

export type Concept = {
  slug: string
  title: string
  question: string
  summary: string
  courseSlug: string
  courseTitle: string
  track: string
  durationMin: number | null
}

export type ConceptCourse = {
  slug: string
  title: string
  description: string
  trackSlug: string
}

const data = manifest as unknown as {
  generated: string
  courses: ConceptCourse[]
  concepts: Concept[]
}

export function getAllConcepts(): Concept[] {
  return data.concepts
}

export function getConcept(slug: string): Concept | undefined {
  return data.concepts.find((c) => c.slug === slug)
}

export function getConceptCourses(): ConceptCourse[] {
  return data.courses
}

export function getRelatedConcepts(concept: Concept, limit = 4): Concept[] {
  return data.concepts
    .filter((c) => c.courseSlug === concept.courseSlug && c.slug !== concept.slug)
    .slice(0, limit)
}
