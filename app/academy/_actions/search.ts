'use server'

import { cache } from 'react'
import { supabaseAdmin } from '@/lib/supabase/server'
import { TOPICS, type TopicKey } from '@/lib/academy/topics'
import { rankAcademySearch, type RankedSearchItem, type SearchItem } from '@/lib/academy/search-logic'

const MAX_RESULTS = 12

/**
 * Build the full searchable item list once per request (courses + their lessons
 * + topics). Wrapped in React `cache` so multiple keystrokes in a single render
 * pass reuse the same DB read. Cross-user, read-only published content → admin
 * client is correct here (no per-user data is touched).
 */
const getSearchItems = cache(async (): Promise<SearchItem[]> => {
  const items: SearchItem[] = []

  // Topics — static, deep-linked into the catalog filter.
  for (const [key, topic] of Object.entries(TOPICS)) {
    items.push({
      kind: 'topic',
      title: topic.label,
      href: `/academy/catalog?topic=${key as TopicKey}`,
      subtitle: 'Topic',
    })
  }

  try {
    const sb = supabaseAdmin()

    const [{ data: courses }, { data: lessons }] = await Promise.all([
      sb.from('academy_courses').select('slug, title, subtitle').eq('status', 'published'),
      sb
        .from('academy_lessons')
        .select('slug, title, course_slug, status')
        .eq('status', 'published'),
    ])

    for (const c of courses ?? []) {
      items.push({
        kind: 'course',
        title: c.title,
        href: `/academy/course/${c.slug}`,
        subtitle: c.subtitle ?? 'Course',
      })
    }

    for (const l of lessons ?? []) {
      items.push({
        kind: 'lesson',
        title: l.title,
        href: `/academy/learn/${l.course_slug}/${l.slug}`,
        subtitle: 'Lesson',
      })
    }
  } catch (err) {
    console.error('[academy/search] getSearchItems failed', err)
    // Topics still searchable — honest partial result over a hard failure.
  }

  return items
})

/** Rank the academy catalog against `query`, returning the top results (~12). */
export async function searchAcademy(query: string): Promise<RankedSearchItem[]> {
  if (!query || !query.trim()) return []
  const items = await getSearchItems()
  return rankAcademySearch(query, items).slice(0, MAX_RESULTS)
}
