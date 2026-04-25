'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionLabel } from '@/components/section-label'
import { ProjectCard } from '@/components/project-card'
import { projects, categories } from '@/data/projects'

export function ProjectsContent() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory)

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
            20+ projects spanning full-stack development, cloud infrastructure, trading systems, automation frameworks, AI tools, and security.
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
          {categories.map((cat) => {
            const count = projects.filter(p => p.category === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#06B6D4] text-[#09090B] font-medium'
                    : 'bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:border-[#06B6D4]/50 hover:text-[#FAFAFA]'
                }`}
              >
                {cat.label} ({count})
              </button>
            )
          })}
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
    </div>
  )
}
