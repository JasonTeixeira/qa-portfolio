import { StateView, PrimaryLink, GhostLink } from '@/components/academy/feedback/StateView'

export default function AcademyNotFound() {
  return (
    <StateView
      glyph="search"
      title="We couldn't find that"
      body="The course, lesson, or path you're after doesn't exist or may have moved. Browse the catalog to find what's next."
    >
      <PrimaryLink href="/academy/catalog">Browse the catalog</PrimaryLink>
      <GhostLink href="/academy">Academy home</GhostLink>
    </StateView>
  )
}
