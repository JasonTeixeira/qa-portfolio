import type { Metadata } from 'next'
import { ServicesContent } from './services-content'

export const metadata: Metadata = {
  title: 'Services | Jason Teixeira - Custom Software Development',
  description: 'Custom software development, test automation, cloud infrastructure, and trading systems. Full-stack solutions from a systems architect with Fortune 50 experience.',
  openGraph: {
    title: 'Services - Custom Software Development',
    description: 'Full-stack development, test automation, cloud infrastructure, and trading systems.',
  },
}

export default function ServicesPage() {
  return <ServicesContent />
}
