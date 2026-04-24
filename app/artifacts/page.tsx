'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileText, Shield, Search, ExternalLink, CheckCircle2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/section-label'
import { qaArtifacts, type ArtifactType } from '@/lib/artifactsData'
import { evidenceItems } from '@/lib/evidenceData'

const typeColors: Record<ArtifactType, string> = {
  Playbook: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20',
  Template: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20',
  Checklist: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20',
  Example: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20',
}

export default function ArtifactsPage() {
  const [activeType, setActiveType] = useState<string>('All')
  const [search, setSearch] = useState('')

  const types = ['All', 'Playbook', 'Template', 'Checklist', 'Example']

  const filteredArtifacts = qaArtifacts.filter(a => {
    const matchesType = activeType === 'All' || a.type === activeType
    const matchesSearch = search === '' ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    return matchesType && matchesSearch
  })

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionLabel>Artifacts</SectionLabel>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAFAFA]">
            Playbooks, Templates & Evidence
          </h1>
          <p className="mt-6 text-lg text-[#A1A1AA] max-w-2xl">
            Downloadable artifacts from real projects — QA playbooks, test strategy templates,
            incident triage guides, security evidence, and a recruiter pack. Everything I use
            to operate production systems.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#71717A]">
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              {qaArtifacts.length} artifacts
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              {evidenceItems.length} evidence items
            </span>
          </div>
        </motion.div>
      </section>

      {/* Recruiter Pack CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 bg-gradient-to-r from-[#06B6D4]/10 to-[#8B5CF6]/10 border border-[#06B6D4]/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h3 className="text-lg font-semibold text-[#FAFAFA]">Recruiter Pack (ZIP)</h3>
            <p className="text-sm text-[#A1A1AA] mt-1">
              One download with my resume, test strategy, architecture samples, and key evidence — designed for quick evaluation.
            </p>
          </div>
          <Button asChild className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold shrink-0">
            <a href="/artifacts/recruiter-pack.zip" download>
              <Download className="mr-2 h-4 w-4" />
              Download Pack
            </a>
          </Button>
        </motion.div>
      </section>

      {/* Filter + Search */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-wrap gap-2">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeType === type
                    ? 'bg-[#06B6D4] text-[#09090B]'
                    : 'bg-[#18181B] text-[#A1A1AA] border border-[#27272A] hover:border-[#3F3F46]'
                }`}
              >
                {type}
                {type !== 'All' && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({qaArtifacts.filter(a => a.type === type).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search artifacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#18181B] border border-[#27272A] rounded-xl text-[#FAFAFA] placeholder-[#71717A] text-sm focus:outline-none focus:border-[#06B6D4] transition-colors"
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-[#71717A]">
          {filteredArtifacts.length} of {qaArtifacts.length} artifacts
        </p>
      </section>

      {/* Artifacts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeType + search}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredArtifacts.map((artifact, index) => (
              <motion.div
                key={artifact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <a
                  href={artifact.downloadPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full p-5 bg-[#18181B] border border-[#27272A] rounded-2xl hover:border-[#06B6D4]/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${typeColors[artifact.type]}`}>
                      {artifact.type}
                    </span>
                    <Download className="h-4 w-4 text-[#71717A] group-hover:text-[#06B6D4] transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#FAFAFA] mb-2 group-hover:text-[#06B6D4] transition-colors">
                    {artifact.title}
                  </h3>
                  <p className="text-xs text-[#71717A] mb-3 line-clamp-2">
                    {artifact.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {artifact.recommendedFor.map(r => (
                        <span key={r} className="text-[10px] font-mono text-[#71717A] bg-[#27272A] px-1.5 py-0.5 rounded">
                          {r}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-[#71717A] font-mono">.{artifact.format}</span>
                  </div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Evidence Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <SectionLabel color="violet">Evidence</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA]">
            Evidence Gallery
          </h2>
          <p className="mt-4 text-[#A1A1AA] max-w-2xl">
            Recruiter-friendly proof that these artifacts connect to real automation outputs:
            reports, CI runs, security scans, and infrastructure evidence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {evidenceItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-5 bg-[#18181B] border border-[#27272A] rounded-2xl"
            >
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle2 className="h-5 w-5 text-[#10B981] mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-[#FAFAFA]">{item.title}</h3>
                  <p className="text-xs text-[#71717A] mt-1">{item.description}</p>
                </div>
              </div>
              <div className="pl-8 flex flex-wrap gap-2">
                {item.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#06B6D4] hover:text-[#22D3EE] transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 bg-[#18181B] border border-[#27272A] rounded-2xl text-center"
        >
          <h3 className="text-2xl font-bold text-[#FAFAFA] mb-3">Want to see these in action?</h3>
          <p className="text-[#A1A1AA] mb-6">Check out the live dashboard or read the platform engineering deep dive.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold">
              <Link href="/dashboard">Live Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent">
              <Link href="/platform">Platform Engineering</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
