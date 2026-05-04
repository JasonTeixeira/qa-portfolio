import type { ComponentType } from 'react'
import { NexuralArchitecture } from './nexural-architecture'
import { AlphastreamArchitecture } from './alphastream-architecture'
import { JobpoiseArchitecture } from './jobpoise-architecture'
import { TraydArchitecture } from './trayd-architecture'
import { AwsLandingZoneArchitecture } from './aws-landing-zone-architecture'
import { QualityTelemetryArchitecture } from './quality-telemetry-architecture'
import { BrandSprintRebuildArchitecture } from './brand-sprint-rebuild-architecture'
import { SiteCareRetainerArchitecture } from './site-care-retainer-architecture'

export const CaseStudyArchitecture: Record<string, ComponentType> = {
  'nexural': NexuralArchitecture,
  'alphastream': AlphastreamArchitecture,
  'jobpoise': JobpoiseArchitecture,
  'trayd': TraydArchitecture,
  'aws-landing-zone': AwsLandingZoneArchitecture,
  'quality-telemetry': QualityTelemetryArchitecture,
  'brand-sprint-rebuild': BrandSprintRebuildArchitecture,
  'site-care-retainer': SiteCareRetainerArchitecture,
}
