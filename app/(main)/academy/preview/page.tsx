import { redirect } from 'next/navigation'

// Legacy alias — the lesson player now lives at the real navigable route.
export default function LessonPreviewRedirect() {
  redirect('/academy/learn/python-basics/logic-conditionals')
}
