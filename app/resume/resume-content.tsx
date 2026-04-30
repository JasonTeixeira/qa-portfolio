'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Download, ExternalLink, Mail, MapPin, Github, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/section-label'

const experience = [
  {
    company: 'HighStrike',
    role: 'Trading Strategy Developer & Finance Analyst',
    period: '2021 - 2026',
    location: 'Remote (Contract)',
    highlights: [
      'Developed trading strategies, indicators, and quantitative research tools for a fintech startup',
      'Built internal web applications and dashboards using Python and JavaScript',
      'Analyzed financial data to support investment decisions and trading operations',
      'Created internal business tools for a 14-person company, automating manual workflows',
      'Self-taught across Python, JavaScript, SQL, and data analysis during this role'
    ]
  },
  {
    company: 'Self-Employed',
    role: 'Freelance Developer & Technical Projects',
    period: '2021 - Present',
    location: 'Orlando, FL (Remote)',
    highlights: [
      'Built 30+ projects on GitHub spanning full-stack apps, trading systems, and cloud infrastructure',
      'Delivered small applications and tools for private clients',
      'Created a fintech ecosystem with 185 database tables, 69 API endpoints, and Stripe billing',
      'Built an ML-powered trading signal system with 200+ indicators and 5 machine learning models',
      'Deployed production applications using Next.js, Supabase, Vercel, and AWS'
    ]
  },
  {
    company: 'Sage Ideas LLC',
    role: 'Founder & General Contractor',
    period: '2016 - 2021',
    location: 'Central Florida',
    highlights: [
      'Founded and operated a residential construction company serving clients across Central Florida',
      'Home Depot contractor — designed and installed kitchens, bathrooms, and full home remodels',
      'Managed projects end-to-end: budgets, timelines, subcontractors, permits, and client delivery',
      'Coordinated crews, sourced materials, and maintained client relationships'
    ]
  }
]

const skills = {
  'Languages': ['TypeScript', 'Python', 'C#/.NET', 'JavaScript', 'SQL', 'HCL'],
  'Frontend': ['Next.js', 'React', 'Tailwind CSS', 'Framer Motion'],
  'Backend': ['Node.js', '.NET 8', 'FastAPI', 'REST APIs', 'GraphQL'],
  'Cloud': ['AWS', 'Vercel', 'Terraform', 'Docker', 'Kubernetes', 'GitHub Actions'],
  'Testing': ['Selenium', 'Playwright', 'Cypress', 'Appium', 'pytest', 'JMeter'],
  'AI/ML': ['GPT-4/Claude API', 'scikit-learn', 'pandas', 'NumPy'],
}

const certifications = [
  'ISTQB CTFL',
  'ISTQB TAE',
  'ISTQB CT-AI',
  'AWS Cloud Essentials',
  'AWS Serverless',
  'AWS Migration Foundations',
  'AWS Braket',
  'AWS Cloud Practitioner',
  'Cisco Networking'
]

export function ResumeContent() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-between items-start gap-6"
        >
          <div>
            <SectionLabel>Resume</SectionLabel>
            <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-[#FAFAFA]">
              Jason Teixeira
            </h1>
            <p className="mt-2 text-xl text-[#06B6D4]">
              Developer & Finance Analyst | Open to Opportunities
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#A1A1AA]">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Orlando, FL (Remote-First)
              </span>
              <Link href="mailto:sage@sageideas.org" className="flex items-center gap-1 hover:text-[#06B6D4]">
                <Mail className="h-4 w-4" />
                sage@sageideas.org
              </Link>
            </div>
            <div className="mt-2 flex items-center gap-4">
              <Link
                href="https://github.com/JasonTeixeira"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#71717A] hover:text-[#06B6D4]"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com/in/jason-teixeira"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#71717A] hover:text-[#06B6D4]"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <Button asChild className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold">
            <a href="/resume.pdf" download>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          </Button>
        </motion.div>
      </section>

      {/* Summary */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-6 bg-[#18181B] border border-[#27272A] rounded-2xl"
        >
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-4">Summary</h2>
          <p className="text-[#A1A1AA] leading-relaxed">
            Resourceful technologist with a non-traditional path — from running a construction company to building trading strategies and fintech tools. B.S. in Computer Science and Finance, 9 certifications (AWS, ISTQB, Cisco), and 30+ projects on GitHub. Spent 5 years at a fintech startup developing trading strategies, analyzing financial data, and building internal applications. Trilingual (English, Portuguese, Spanish). U.S. citizen seeking an entry-level remote role where I can contribute, learn, and grow.
          </p>
        </motion.div>
      </section>

      {/* Experience */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-6">Experience</h2>
          <div className="space-y-6">
            {experience.map((job, index) => (
              <div
                key={index}
                className="p-6 bg-[#18181B] border border-[#27272A] rounded-2xl"
              >
                <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#FAFAFA]">{job.role}</h3>
                    <p className="text-[#06B6D4]">{job.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-[#A1A1AA]">{job.period}</p>
                    <p className="text-sm text-[#71717A]">{job.location}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {job.highlights.map((highlight, i) => (
                    <li key={i} className="text-sm text-[#A1A1AA] flex items-start gap-2">
                      <span className="text-[#06B6D4] mt-1">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/about" className="text-sm text-[#06B6D4] hover:text-[#22D3EE]">
              View full career timeline <ExternalLink className="inline h-3 w-3 ml-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Skills */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-6">Skills</h2>
          <div className="p-6 bg-[#18181B] border border-[#27272A] rounded-2xl">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(skills).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-[#FAFAFA] mb-2">{category}</h3>
                  <p className="text-sm text-[#A1A1AA]">{items.join(' · ')}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link href="/stack" className="text-sm text-[#06B6D4] hover:text-[#22D3EE]">
              View full tech stack <ExternalLink className="inline h-3 w-3 ml-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Certifications */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-6">Certifications</h2>
          <div className="p-6 bg-[#18181B] border border-[#27272A] rounded-2xl">
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert) => (
                <span
                  key={cert}
                  className="text-sm text-[#A1A1AA] bg-[#27272A] px-3 py-1.5 rounded-lg"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Education */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-6">Education</h2>
          <div className="space-y-4">
            <div className="p-6 bg-[#18181B] border border-[#27272A] rounded-2xl">
              <p className="text-[#FAFAFA] font-medium">B.S. Finance</p>
              <p className="text-sm text-[#71717A]">Kean University</p>
            </div>
            <div className="p-6 bg-[#18181B] border border-[#27272A] rounded-2xl">
              <p className="text-[#FAFAFA] font-medium">B.S. Computer Science</p>
              <p className="text-sm text-[#71717A]">Full Sail University</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Projects Link */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 bg-[#18181B] border border-[#27272A] rounded-2xl text-center"
        >
          <h2 className="text-xl font-bold text-[#FAFAFA] mb-4">Want to see what I&apos;ve built?</h2>
          <p className="text-[#A1A1AA] mb-6">
            Check out my Projects spanning full-stack development, trading systems, and automation frameworks.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE]">
              <Link href="/projects">
                View Projects
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-[#27272A] text-[#A1A1AA] hover:text-[#06B6D4] hover:border-[#06B6D4]">
              <Link href="/case-studies">
                Read Case Studies
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
