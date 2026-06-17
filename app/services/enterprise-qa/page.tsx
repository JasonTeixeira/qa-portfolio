import {
  LegacyServiceAliasPage,
  legacyServiceAliasMetadata,
} from '@/components/living/LegacyServiceAliasPage'

export const metadata = legacyServiceAliasMetadata('enterprise-qa')

export default function EnterpriseQAPage() {
  return <LegacyServiceAliasPage slug="enterprise-qa" />
}
