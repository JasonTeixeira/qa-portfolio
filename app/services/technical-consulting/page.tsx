import {
  LegacyServiceAliasPage,
  legacyServiceAliasMetadata,
} from '@/components/living/LegacyServiceAliasPage'

export const metadata = legacyServiceAliasMetadata('technical-consulting')

export default function TechnicalConsultingPage() {
  return <LegacyServiceAliasPage slug="technical-consulting" />
}
