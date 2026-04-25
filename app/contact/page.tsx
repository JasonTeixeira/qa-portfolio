import type { Metadata } from 'next'
import { ContactContent } from './contact-content'

export const metadata: Metadata = {
  title: 'Contact | Jason Teixeira — Hire Me or Start a Project',
  description: 'Get in touch about full-time roles, consulting projects, or custom software development. Open to remote positions. Typically responds within 24 hours.',
  openGraph: {
    title: 'Contact Jason Teixeira',
    description: 'Available for hire and consulting. Custom software, automation, trading systems, cloud infrastructure.',
  },
}

export default function ContactPage() {
  return <ContactContent />
}
