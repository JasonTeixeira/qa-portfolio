import {
  LegacyServiceAliasPage,
  legacyServiceAliasMetadata,
} from '@/components/living/LegacyServiceAliasPage'

export const metadata = legacyServiceAliasMetadata('trading-systems')

export default function TradingSystemsPage() {
  return <LegacyServiceAliasPage slug="trading-systems" />
}
