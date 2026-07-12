import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LabRunner } from '@/components/academy/lab/LabRunner'
import { flagshipLesson } from '@/data/academy/flagship-sprint'

export const metadata: Metadata = {
  title: 'Lab — The Learning Engine',
  robots: { index: false, follow: false },
}

export default function EngineLabPage() {
  const lab = flagshipLesson.blocks.find((b) => b.type === 'lab')
  if (!lab || lab.type !== 'lab') notFound()

  return (
    <LabRunner
      title={lab.title}
      summary={lab.summary}
      starter={lab.starter ?? '# Write your Python here\n'}
      hasCheck={Boolean(lab.check)}
      backHref="/academy/engine"
      courseSlug="_engine"
      lessonSlug="flagship"
    />
  )
}
