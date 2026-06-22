import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminUser, getAdminCourse } from '@/lib/academy/admin'
import { CourseEditor } from '../CourseEditor'
import { Gate } from '../Gate'

export const metadata: Metadata = { title: 'Course editor — Sage Academy', robots: { index: false, follow: false } }

export default async function CourseEditorPage({ params }: { params: Promise<{ course: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return <Gate />
  const { course } = await params
  const data = await getAdminCourse(course)
  if (!data) notFound()
  return <CourseEditor course={data.course} lessons={data.lessons} />
}
