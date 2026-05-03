import type { Metadata } from 'next'
import { ContactContent } from './contact-content'

export const metadata: Metadata = {
  title: 'Contact — Sage Ideas Studio',
  description: 'Tell us about your project. AI products, internal tools, full builds, and fractional engineering for B2B operators. Strategy calls and productized engagements available.',
  openGraph: {
    title: 'Contact Sage Ideas',
    description: 'AI-native studio for B2B operators. Strategy calls, productized engagements, and flagship business builds.',
  },
}

export default function ContactPage() {
  return <ContactContent />
}
