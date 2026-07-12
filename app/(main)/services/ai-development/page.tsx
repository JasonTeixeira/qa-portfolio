import {
  LegacyServiceAliasPage,
  legacyServiceAliasMetadata,
} from '@/components/living/LegacyServiceAliasPage'

export const metadata = legacyServiceAliasMetadata('ai-development')

export default function AIDevelopmentPage() {
  return <LegacyServiceAliasPage slug="ai-development" />
}
