import type { Metadata } from 'next'
import { ContactRelaunchContent } from './contact-relaunch-content'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev/contact' },
  title: 'Tell Sage Ideas What You Want Built',
  description:
    'Send the business problem, workflow, or website leak you want fixed. Sage Ideas replies with the right build path, demo, or next step.',
  openGraph: {
    title: 'Tell Sage Ideas What You Want Built',
    description: 'Send the problem. Get the right build path.',
    images: ['/og?title=Tell%20Sage%20Ideas%20What%20You%20Want%20Built&subtitle=Send%20the%20problem.%20Get%20the%20right%20path.'],
  },
}

export default function ContactPage() {
  return <ContactRelaunchContent />
}
