import fs from 'fs'
import path from 'path'
import { parseFrontmatter } from '@/lib/frontmatter'

export interface FieldNote {
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  summary: string
  body: string
}

const FIELD_NOTES_DIR = path.join(process.cwd(), 'content', 'field-notes')

/**
 * Read a single field-note MDX file and return a FieldNote object.
 */
function parseFieldNoteFile(filename: string): FieldNote | null {
  const filepath = path.join(FIELD_NOTES_DIR, filename)
  try {
    const raw = fs.readFileSync(filepath, 'utf-8')
    const { data, content } = parseFrontmatter(raw)

    return {
      slug: data.slug ?? filename.replace(/\.mdx?$/, ''),
      title: data.title ?? '',
      date: data.date ?? '2026-01-01',
      category: data.category ?? 'Systems',
      tags: Array.isArray(data.tags) ? data.tags : [],
      summary: data.summary ?? '',
      body: content,
    }
  } catch {
    return null
  }
}

/**
 * Get all field notes, sorted newest-first by date.
 */
export function getAllFieldNotes(): FieldNote[] {
  if (!fs.existsSync(FIELD_NOTES_DIR)) return []

  const files = fs.readdirSync(FIELD_NOTES_DIR).filter((f) => f.endsWith('.mdx'))
  return files
    .map(parseFieldNoteFile)
    .filter((note): note is FieldNote => note !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Get a single field note by slug.
 */
export function getFieldNoteBySlug(slug: string): FieldNote | undefined {
  const directPath = path.join(FIELD_NOTES_DIR, `${slug}.mdx`)
  if (fs.existsSync(directPath)) {
    return parseFieldNoteFile(`${slug}.mdx`) ?? undefined
  }
  return getAllFieldNotes().find((note) => note.slug === slug)
}
