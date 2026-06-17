'use client'

import { motion } from 'framer-motion'
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
  const totalItems = techStack.reduce((sum, category) => sum + category.items.length, 0)
  const expertItems = techStack.reduce(
    (sum, category) => sum + category.items.filter((tech) => tech.proficiency === 'Expert').length,
    0,
  )

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--sage-bg)] text-[var(--sage-ink)]">
      <section className="border-b border-[var(--sage-border)] px-5 pb-16 pt-28 sm:px-8 lg:px-12 lg:pb-24 lg:pt-36">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_QUINT }}
          >
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Stack · shipped systems
            </p>
            <h1
              className="max-w-[10ch] text-[clamp(3.2rem,_1.2rem_+_8vw,_7rem)] font-extrabold text-[var(--sage-ink)]"
              style={HEADING_STYLE}
            >
              The stack I actually ship with.
            </h1>
            <p className="mt-8 max-w-[62ch] text-lg leading-[1.6] text-[var(--sage-ink-muted)] sm:text-xl">
              A practical full-stack toolset across product UI, AI workflows, infrastructure,
              testing, market data, and payments. Not a logo wall. The stack follows the build.
            </p>
          </motion.div>

          <aside className="border border-[var(--sage-border-strong)] bg-[rgba(20,20,24,0.76)] p-5 sm:p-6">
            <div className="mb-10 flex items-center justify-between gap-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--sage-accent-readable)]">
                Capability graph
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                Surface ⇄ System
              </p>
            </div>
            <div className="grid gap-px bg-[var(--sage-border)] sm:grid-cols-3">
              {[
                { label: 'categories', value: String(techStack.length) },
                { label: 'technologies', value: `${totalItems}+` },
                { label: 'expert', value: String(expertItems) },
              ].map((stat) => (
                <div className="bg-[rgba(11,11,14,0.74)] p-4" key={stat.label}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                    {stat.label}
                  </p>
                  <p className="mt-4 text-2xl font-semibold text-[var(--sage-ink)]">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-3">
              {techStack.slice(0, 5).map((category, index) => (
                <div className="flex items-center gap-3" key={category.name}>
                  <span className="font-mono text-xs text-[var(--sage-accent-readable)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="h-px flex-1 bg-[var(--sage-border)]" />
                  <span className="text-sm text-[var(--sage-ink-muted)]">{category.name}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="mx-auto mt-12 max-w-7xl">
          <div className="grid gap-px bg-[var(--sage-border)] sm:grid-cols-3">
            {[
              { label: 'frontend', value: 'Next / React' },
              { label: 'backend', value: 'Node / Python' },
              { label: 'ops', value: 'Vercel / AWS' },
            ].map((stat) => (
              <div className="bg-[rgba(20,20,24,0.72)] p-5" key={stat.label}>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                  {stat.label}
                </p>
                <p className="mt-4 text-2xl font-semibold leading-none text-[var(--sage-ink)]">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              stack matrix
            </p>
            <h2
              className="text-[clamp(2.3rem,_1.2rem_+_4vw,_5rem)] font-extrabold text-[var(--sage-ink)]"
              style={HEADING_STYLE}
            >
              Practical coverage, grouped by build layer.
            </h2>
          </div>

          <div className="space-y-12">
          {techStack.map((category, categoryIndex) => (
            <section aria-label={category.name} key={category.name}>
              <div className="mb-6 flex items-center gap-4 border-t border-[var(--sage-border)] pt-6">
                <span className="font-mono text-xs text-[var(--sage-accent-readable)]">
                  {String(categoryIndex + 1).padStart(2, '0')}
                </span>
                <div className="h-px flex-1 bg-[var(--sage-border)]" />
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-ink-muted)]">
                  {category.name}
                </span>
                <div className="h-px flex-1 bg-[var(--sage-border)]" />
              </div>
              <div className="grid gap-px bg-[var(--sage-border)] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {category.items.map((tech, techIndex) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: techIndex * 0.025, ease: EASE_OUT_QUINT }}
                    className="bg-[rgba(20,20,24,0.72)] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-sm text-[var(--sage-ink)]">{tech.name}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)]">
                        {tech.proficiency}
                      </span>
                    </div>
                    <div className="h-px overflow-hidden rounded-full bg-[var(--sage-border)]">
                      <div
                        className={`${proficiencyBarWidth[tech.proficiency]} h-full bg-[var(--sage-accent)] transition-all duration-500`}
                        style={{ opacity: tech.proficiency === 'Expert' ? 1 : tech.proficiency === 'Advanced' ? 0.68 : 0.42 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 border border-[rgba(61,90,254,0.34)] bg-[rgba(61,90,254,0.08)] p-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                build fit
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--sage-ink-muted)]">
                The stack changes by problem. The standard does not: typed boundaries, visible
                proof, instrumentation, and code that can be operated after launch.
              </p>
            </div>
            <a
              href="/book?context=stack"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--sage-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[#5670ff]"
            >
              Scope a build <span aria-hidden className="ml-1">-&gt;</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
