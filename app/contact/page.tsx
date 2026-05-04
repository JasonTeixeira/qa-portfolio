import type { Metadata } from 'next'
import { ContactRelaunchContent } from './contact-relaunch-content'

export const metadata: Metadata = {
  alternates: { canonical: 'https://sageideas.dev/contact' },
  title: 'Contact — Sage Ideas Studio',
  description:
    'Get in touch with Sage Ideas. Book a strategy call, send an email, or visit the founder page to learn more about the studio.',
  openGraph: {
    title: 'Contact — Sage Ideas',
    description: 'Email, book a call, or reach out about a project. We respond to well-matched inquiries within 48 hours.',
    images: ['/og?title=Get+in+Touch&subtitle=sage@sageideas.dev'],
  },
}

export default function ContactPage() {
  return <ContactRelaunchContent />
}
