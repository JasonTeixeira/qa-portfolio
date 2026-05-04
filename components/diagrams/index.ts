import type { ComponentType } from 'react'
import { NexuralArchitecture } from './nexural-architecture'
import { AlphastreamArchitecture } from './alphastream-architecture'
import { JobpoiseArchitecture } from './jobpoise-architecture'
import { TraydArchitecture } from './trayd-architecture'
import { AwsLandingZoneArchitecture } from './aws-landing-zone-architecture'
import { QualityTelemetryArchitecture } from './quality-telemetry-architecture'
import { BrandSprintRebuildArchitecture } from './brand-sprint-rebuild-architecture'
import { SiteCareRetainerArchitecture } from './site-care-retainer-architecture'
import { AiImplementationConsultingFlow } from './ai-implementation-consulting-flow'
import { AiAgentDevelopmentFlow } from './ai-agent-development-flow'
import { AiVoiceAgentFlow } from './ai-voice-agent-flow'
import { AiLeadEngineFlow } from './ai-lead-engine-flow'
import { AgentOperationsRetainerFlow } from './agent-operations-retainer-flow'

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

export const AgentFlowDiagrams: Record<string, ComponentType> = {
  'ai-implementation-consulting': AiImplementationConsultingFlow,
  'ai-agent-development': AiAgentDevelopmentFlow,
  'ai-voice-agent': AiVoiceAgentFlow,
  'ai-lead-engine': AiLeadEngineFlow,
  'agent-operations-retainer': AgentOperationsRetainerFlow,
}
