import type { Metadata } from 'next'
import { getAdminUser, getAdminCourses } from '@/lib/academy/admin'
import { StudioHome } from './StudioHome'
import { Gate } from './Gate'

export const metadata: Metadata = { title: 'Studio — Sage Academy', robots: { index: false, follow: false } }

export default async function StudioPage() {
  const admin = await getAdminUser()
  if (!admin) return <Gate />
  const courses = await getAdminCourses()
  return <StudioHome courses={courses} />
}
