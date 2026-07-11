import { AgencyNav } from '@/components/agency/nav'
import { Hero } from '@/components/agency/hero'
import { Marquee } from '@/components/agency/marquee'
import { GateRunner } from '@/components/agency/gate-runner'
import { ScanSection } from '@/components/agency/sections/scan'
import { ProofGridSection } from '@/components/agency/sections/proof-grid'
import { AnatomySelector } from '@/components/agency/islands/anatomy'
import { CaseStudiesSection } from '@/components/agency/sections/case-studies'
import { GroundingDemo } from '@/components/agency/islands/grounding-demo'
import { TestPyramid } from '@/components/agency/islands/test-pyramid'
import { BeforeAfterToggle } from '@/components/agency/islands/before-after'
import { LedgerSection } from '@/components/agency/sections/ledger'
import { SkillsSection } from '@/components/agency/sections/skills'
import { WorkSamplesSection } from '@/components/agency/sections/work-samples'
import { WritingSection } from '@/components/agency/sections/writing'
import { ContactSection } from '@/components/agency/sections/contact'
import { AgencyFooter } from '@/components/agency/footer'

export default function AgencyPage() {
  return (
    <>
      <AgencyNav />
      <main>
        <Hero instrument={<GateRunner />} />
        <Marquee />
        <ScanSection />
        <ProofGridSection />
        <AnatomySelector />
        <CaseStudiesSection
          demos={{
            'voza-verification': <TestPyramid />,
            'sage-kernel-course-auditor': <GroundingDemo />,
            'giggl-release-lane': <BeforeAfterToggle />,
          }}
        />
        <LedgerSection />
        <SkillsSection />
        <WorkSamplesSection />
        <WritingSection />
        <ContactSection />
      </main>
      <AgencyFooter />
    </>
  )
}
