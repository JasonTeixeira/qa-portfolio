import {
  LegacyServiceAliasPage,
  legacyServiceAliasMetadata,
} from '@/components/living/LegacyServiceAliasPage'

export const metadata = legacyServiceAliasMetadata('fintech')

export default function FintechPage() {
  return <LegacyServiceAliasPage slug="fintech" />
}
