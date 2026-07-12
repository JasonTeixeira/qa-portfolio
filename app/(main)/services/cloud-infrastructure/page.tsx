import {
  LegacyServiceAliasPage,
  legacyServiceAliasMetadata,
} from '@/components/living/LegacyServiceAliasPage'

export const metadata = legacyServiceAliasMetadata('cloud-infrastructure')

export default function CloudInfrastructurePage() {
  return <LegacyServiceAliasPage slug="cloud-infrastructure" />
}
