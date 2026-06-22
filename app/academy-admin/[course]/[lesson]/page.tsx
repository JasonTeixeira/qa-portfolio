import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminUser, getAdminLesson } from '@/lib/academy/admin'
import { LessonEditor } from '../../LessonEditor'
import { Gate } from '../../Gate'

export const metadata: Metadata = { title: 'Lesson editor — Sage Academy', robots: { index: false, follow: false } }

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ course: string; lesson: string }>
}) {
  const admin = await getAdminUser()
  if (!admin) return <Gate />
  const { course, lesson } = await params
  if (lesson === 'new') {
    return <LessonEditor courseSlug={course} initial={{ blocks: [] }} isNew />
  }
  const data = await getAdminLesson(course, lesson)
  if (!data) notFound()
  return <LessonEditor courseSlug={course} initial={data} isNew={false} />
}
