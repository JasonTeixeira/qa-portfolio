import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/server'
import { TRACKS } from '@/lib/academy/taxonomy'
import { TOPICS, type TopicKey } from '@/lib/academy/topics'

/**
 * Real academy stats for the marketing Home. Computed live from Supabase so the
 * headline numbers stay fresh: published-course count and total published
 * lessons. NEVER falls back to a fabricated number — if the query fails we fall
 * back to the taxonomy's own track count and a lessons total of 0 (unknown), so
 * the page can only ever under-claim, never over-claim.
 */

export type AcademyCourseCard = {
  slug: string
  title: string
  subtitle: string | null
  topic: TopicKey
  level: string
  lessons: number
}

export type AcademyStats = {
  coursesCount: number
  lessonsCount: number
  courses: AcademyCourseCard[]
}

const KNOWN_TOPICS = new Set<string>(Object.keys(TOPICS))

function normalizeTopic(value: unknown): TopicKey {
  return typeof value === 'string' && KNOWN_TOPICS.has(value) ? (value as TopicKey) : 'engineering'
}

type CourseRow = {
  slug: string | null
  title: string | null
  subtitle: string | null
  topic: string | null
  level: string | null
  lessons: number | null
  status: string | null
}

// Order courses so the catalog preview leads with the flagship judgment/AI work.
const TOPIC_PRIORITY: Record<TopicKey, number> = {
  foundations: 0,
  'ai-engineering': 1,
  engineering: 2,
  data: 3,
  'ship-it': 4,
  growth: 5,
}

function taxonomyFallback(): AcademyStats {
  // Honest degraded state: taxonomy track count, unknown lesson total (0), and
  // synthetic-free cards drawn from the real track list (never invented names).
  const courses: AcademyCourseCard[] = TRACKS.filter((t) => t.status === 'live').map((t) => ({
    slug: t.id,
    title: t.name,
    subtitle: t.outcome,
    topic: normalizeTopic(t.topic),
    level: 'Beginner',
    lessons: 0,
  }))
  return { coursesCount: TRACKS.length, lessonsCount: 0, courses }
}

export async function getAcademyStats(): Promise<AcademyStats> {
  try {
    const admin = supabaseAdmin()
    const { data, error } = await admin
      .from('academy_courses')
      .select('slug, title, subtitle, topic, level, lessons, status')
      .eq('status', 'published')

    if (error || !data || data.length === 0) return taxonomyFallback()

    const rows = data as CourseRow[]
    const courses: AcademyCourseCard[] = rows
      .filter((r): r is CourseRow & { slug: string; title: string } => !!r.slug && !!r.title)
      .map((r) => ({
        slug: r.slug,
        title: r.title,
        subtitle: r.subtitle,
        topic: normalizeTopic(r.topic),
        level: r.level ?? 'Beginner',
        lessons: r.lessons ?? 0,
      }))
      .sort((a, b) => {
        const p = TOPIC_PRIORITY[a.topic] - TOPIC_PRIORITY[b.topic]
        return p !== 0 ? p : b.lessons - a.lessons
      })

    const lessonsCount = courses.reduce((sum, c) => sum + c.lessons, 0)
    return { coursesCount: courses.length, lessonsCount, courses }
  } catch {
    return taxonomyFallback()
  }
}
