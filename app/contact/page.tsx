import type { Metadata } from 'next'
import { ContactRelaunchContent } from './contact-relaunch-content'

export const metadata: Metadata = {
  title: 'Contact — Sage Ideas Studio',
  description:
    'Get in touch with Sage Ideas. Book a strategy call, send an email, or connect with the founder for hiring inquiries.',
  openGraph: {
    title: 'Contact — Sage Ideas',
    description: 'Email, book a call, or reach out about hiring. We respond to well-matched inquiries within 48 hours.',
    images: ['/og?title=Get+in+Touch&subtitle=sage@sageideas.dev'],
  },
}

export default function ContactPage() {
  return <ContactRelaunchContent />
}
