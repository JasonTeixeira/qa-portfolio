'use client'

import { motion } from 'framer-motion'
import { Section, Surface, Hairline, MonoLabel, Reveal } from '@/components/el'
import { EASE_OUT_QUINT } from '@/lib/motion/presets'

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
}

type Proficiency = 'Expert' | 'Advanced' | 'Intermediate'

interface Tech {
  name: string
  proficiency: Proficiency
}

interface TechCategory {
  name: string
  items: Tech[]
}

const techStack: TechCategory[] = [
  {
    name: 'Languages',
    items: [
      { name: 'TypeScript', proficiency: 'Expert' },
      { name: 'Python', proficiency: 'Expert' },
      { name: 'C# / .NET', proficiency: 'Advanced' },
      { name: 'JavaScript', proficiency: 'Expert' },
      { name: 'SQL', proficiency: 'Advanced' },
      { name: 'Bash/Shell', proficiency: 'Advanced' },
      { name: 'HCL', proficiency: 'Advanced' },
    ]
  },
  {
    name: 'Frontend',
    items: [
      { name: 'Next.js', proficiency: 'Expert' },
      { name: 'React', proficiency: 'Expert' },
      { name: 'Tailwind CSS', proficiency: 'Expert' },
      { name: 'Framer Motion', proficiency: 'Advanced' },
      { name: 'HTML/CSS', proficiency: 'Expert' },
    ]
  },
  {
    name: 'Backend',
    items: [
      { name: 'Node.js', proficiency: 'Expert' },
      { name: '.NET 8', proficiency: 'Advanced' },
      { name: 'Express', proficiency: 'Advanced' },
      { name: 'FastAPI', proficiency: 'Advanced' },
      { name: 'REST APIs', proficiency: 'Expert' },
      { name: 'GraphQL', proficiency: 'Intermediate' },
    ]
  },
  {
    name: 'Databases',
    items: [
      { name: 'PostgreSQL', proficiency: 'Advanced' },
      { name: 'Supabase', proficiency: 'Expert' },
      { name: 'DynamoDB', proficiency: 'Intermediate' },
      { name: 'Redis', proficiency: 'Intermediate' },
      { name: 'SQLite', proficiency: 'Advanced' },
    ]
  },
  {
    name: 'Cloud & Infrastructure',
    items: [
      { name: 'AWS', proficiency: 'Advanced' },
      { name: 'Vercel', proficiency: 'Expert' },
      { name: 'Terraform', proficiency: 'Advanced' },
      { name: 'Docker', proficiency: 'Advanced' },
      { name: 'Kubernetes', proficiency: 'Advanced' },
      { name: 'GitHub Actions', proficiency: 'Expert' },
      { name: 'Jenkins', proficiency: 'Advanced' },
      { name: 'CloudFormation', proficiency: 'Intermediate' },
    ]
  },
  {
    name: 'Testing & QA',
    items: [
      { name: 'Selenium', proficiency: 'Expert' },
      { name: 'Playwright', proficiency: 'Expert' },
      { name: 'Cypress', proficiency: 'Advanced' },
      { name: 'Appium', proficiency: 'Advanced' },
      { name: 'pytest', proficiency: 'Expert' },
      { name: 'JMeter', proficiency: 'Advanced' },
      { name: 'Postman', proficiency: 'Expert' },
      { name: 'BDD/Cucumber', proficiency: 'Advanced' },
      { name: 'Allure', proficiency: 'Advanced' },
    ]
  },
  {
    name: 'AI & Data',
    items: [
      { name: 'GPT-4 / Claude API', proficiency: 'Advanced' },
      { name: 'scikit-learn', proficiency: 'Intermediate' },
      { name: 'pandas', proficiency: 'Advanced' },
      { name: 'NumPy', proficiency: 'Intermediate' },
      { name: 'Pydantic', proficiency: 'Advanced' },
    ]
  },
  {
    name: 'Trading & Market Data',
    items: [
      { name: 'NinjaTrader 8', proficiency: 'Expert' },
      { name: 'Sierra Chart', proficiency: 'Advanced' },
      { name: 'Alpaca API', proficiency: 'Advanced' },
      { name: 'Market Data APIs', proficiency: 'Advanced' },
    ]
  },
  {
    name: 'Tools & Platforms',
    items: [
      { name: 'Git', proficiency: 'Expert' },
      { name: 'GitHub', proficiency: 'Expert' },
      { name: 'Jira', proficiency: 'Advanced' },
      { name: 'Discord.js', proficiency: 'Advanced' },
      { name: 'Stripe API', proficiency: 'Advanced' },
      { name: 'Allure Reports', proficiency: 'Advanced' },
      { name: 'TestRail', proficiency: 'Advanced' },
    ]
  },
]

const proficiencyBarWidth: Record<Proficiency, string> = {
  Expert: 'w-full',
  Advanced: 'w-3/4',
  Intermediate: 'w-1/2',
}

export function StackContent() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-[var(--sage-bg)]">
      {/* Hero */}
      <section aria-label="Technology stack" className="max-w-7xl mx-auto px-5 sm:px-8 mb-16 border-b border-[var(--sage-border)] pb-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_QUINT }}
        >
          <div className="mb-7 flex items-center gap-4">
            <MonoLabel tone="accent">01</MonoLabel>
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">// stack</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <h1
            className="text-[var(--sage-ink)] font-normal text-[clamp(2.4rem,1.2rem+4vw,5rem)]"
            style={HEADING_STYLE}
          >
            Technologies I Work With
          </h1>
          <p className="mt-6 text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] max-w-2xl sm:text-base">
            50+ technologies across the full stack — from frontend to infrastructure to trading systems.
          </p>
        </motion.div>
      </section>

      {/* Tech Grid */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="space-y-16">
          {techStack.map((category, categoryIndex) => (
            <Reveal key={category.name} delay={0}>
              <section aria-label={category.name}>
                <div className="mb-6 flex items-center gap-4 border-t border-[var(--sage-border)] pt-6">
                  <MonoLabel tone="accent">{String(categoryIndex + 1).padStart(2, '0')}</MonoLabel>
                  <Hairline className="flex-1" />
                  <MonoLabel tone="muted">// {category.name.toLowerCase()}</MonoLabel>
                  <Hairline className="flex-1" strong />
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {category.items.map((tech, techIndex) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: techIndex * 0.04, ease: EASE_OUT_QUINT }}
                    >
                      <Surface level={2} interactive className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-[var(--sage-ink)]">{tech.name}</span>
                          <MonoLabel tone="faint">{tech.proficiency}</MonoLabel>
                        </div>
                        <div className="h-px bg-[var(--sage-border)] overflow-hidden rounded-full">
                          <div
                            className={`h-full ${proficiencyBarWidth[tech.proficiency]} bg-[#0ED3CF] transition-all duration-500`}
                            style={{ opacity: tech.proficiency === 'Expert' ? 1 : tech.proficiency === 'Advanced' ? 0.7 : 0.4 }}
                          />
                        </div>
                      </Surface>
                    </motion.div>
                  ))}
                </div>
              </section>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  )
}
