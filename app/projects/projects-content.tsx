'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { ProjectCard } from '@/components/project-card'
import { Button } from '@/components/ui/button'
import { projects, categories } from '@/data/projects'

export function ProjectsContent() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory)

  // Filter out the "all" entry from categories since we render it separately
  const categoryFilters = categories.filter(c => c.slug !== 'all')

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionLabel>Work</SectionLabel>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAFAFA]">
            {"Everything I've Built"}
          </h1>
          <p className="mt-6 text-lg text-[#A1A1AA] max-w-2xl">
            Production systems, trading platforms, automation frameworks, and cloud infrastructure — each project with verified source code and real results.
          </p>
        </motion.div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-2"
        >
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              activeCategory === 'all'
                ? 'bg-[#06B6D4] text-[#09090B] font-medium'
                : 'bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:border-[#06B6D4]/50 hover:text-[#FAFAFA]'
            }`}
          >
            All ({projects.length})
          </button>
          {categoryFilters.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                activeCategory === cat.slug
                  ? 'bg-[#06B6D4] text-[#09090B] font-medium'
                  : 'bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:border-[#06B6D4]/50 hover:text-[#FAFAFA]'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </motion.div>
      </section>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 bg-[#18181B] border border-[#27272A] rounded-2xl text-center"
        >
          <h3 className="text-2xl font-bold text-[#FAFAFA] mb-3">Want to see how I build?</h3>
          <p className="text-[#A1A1AA] mb-6">Read the deep dives on architecture, challenges, and results.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold">
              <Link href="/case-studies">
                Read Case Studies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#8B5CF6] hover:text-[#8B5CF6] bg-transparent">
              <Link href="/platform">Platform Engineering</Link>
            </Button>
            <Button asChild variant="outline" className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent">
              <Link href="/contact">Hire Me</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
