import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminUser, getAdminCourses } from '@/lib/academy/admin'
import { getAllFieldNotes } from '@/lib/field-notes'
import { StudioHome } from './StudioHome'

export const metadata: Metadata = { title: 'Studio — Sage Academy', robots: { index: false, follow: false } }

export default async function StudioPage() {
  const admin = await getAdminUser()
  if (!admin) notFound()
  const courses = await getAdminCourses()
  const fieldNoteCount = getAllFieldNotes().length
  return <StudioHome courses={courses} fieldNoteCount={fieldNoteCount} />
}
