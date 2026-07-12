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
import { CareerNumbers } from '@/components/agency/career-numbers'
import { Manifesto } from '@/components/agency/manifesto'
import { WorkSamplesSection } from '@/components/agency/sections/work-samples'
import { WritingSection } from '@/components/agency/sections/writing'
import { AboutSection } from '@/components/agency/sections/about'
import { ProcessSection } from '@/components/agency/sections/process'
import { ContactSection } from '@/components/agency/sections/contact'
import { AgencyFooter } from '@/components/agency/footer'

export default function AgencyPage() {
  return (
    <>
      <AgencyNav />
      <main id="main-content" tabIndex={-1}>
        <Hero instrument={<GateRunner />} />
        <Marquee />
        <CareerNumbers />
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
        <Manifesto />
        <WorkSamplesSection />
        <WritingSection />
        <AboutSection />
        <ProcessSection />
        <ContactSection />
      </main>
      <AgencyFooter />
    </>
  )
}
