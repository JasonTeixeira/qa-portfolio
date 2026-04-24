'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { Github, ExternalLink, FileText, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Project } from '@/data/projects'

const statusColors = {
  production: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
  active: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20',
  'open-source': 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20',
  archived: 'bg-[#71717A]/10 text-[#71717A] border-[#71717A]/20',
}

const statusLabels = {
  production: 'Production',
  active: 'Active',
  'open-source': 'Open Source',
  archived: 'Archived',
}

const categoryLabels: Record<string, string> = {
  'full-stack': 'Full-Stack',
  fintech: 'FinTech',
  cloud: 'Cloud',
  qa: 'QA',
  ai: 'AI',
  security: 'Security',
  'open-source': 'Open Source',
}

interface ProjectCardProps {
  project: Project
  index?: number
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden transition-all duration-300"
      whileHover={{ y: -4 }}
    >
      {/* Glow effect following cursor */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
          style={{
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(6, 182, 212, 0.1), transparent 40%)`
          }}
        />
      )}
      
      {/* Gradient border on hover */}
      <div
        className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        style={{
          padding: '1px',
          background: 'linear-gradient(135deg, #06B6D4, transparent 50%, #8B5CF6)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}
      />

      {/* Image Placeholder */}
      <div className="aspect-video bg-[#27272A] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06B6D4]/5 to-[#8B5CF6]/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#71717A] font-mono text-sm">{project.name}</span>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="text-xs font-mono text-[#A1A1AA] bg-[#09090B]/80 backdrop-blur-sm px-2 py-1 rounded">
            {categoryLabels[project.category]}
          </span>
        </div>
        
        {/* Hover overlay with quick actions */}
        <motion.div
          className="absolute inset-0 bg-[#09090B]/80 backdrop-blur-sm flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          {project.github && (
            <Link
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#18181B] rounded-full text-[#A1A1AA] hover:text-[#06B6D4] hover:bg-[#27272A] transition-all"
            >
              <Github className="h-5 w-5" />
            </Link>
          )}
          {project.liveUrl && (
            <Link
              href={project.liveUrl}
              target={project.liveUrl.startsWith('http') ? '_blank' : undefined}
              rel={project.liveUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="p-3 bg-[#18181B] rounded-full text-[#A1A1AA] hover:text-[#06B6D4] hover:bg-[#27272A] transition-all"
            >
              <ExternalLink className="h-5 w-5" />
            </Link>
          )}
          {project.caseStudy && (
            <Link
              href={project.caseStudy}
              className="p-3 bg-[#18181B] rounded-full text-[#A1A1AA] hover:text-[#06B6D4] hover:bg-[#27272A] transition-all"
            >
              <FileText className="h-5 w-5" />
            </Link>
          )}
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6 relative z-10">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-[#FAFAFA] group-hover:text-[#06B6D4] transition-colors">
            {project.name}
          </h3>
          {project.isPrivate && (
            <Lock className="h-4 w-4 text-[#71717A] flex-shrink-0" />
          )}
        </div>

        <p className="text-sm text-[#A1A1AA] mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono text-[#71717A] bg-[#27272A] px-2 py-1 rounded hover:bg-[#3F3F46] transition-colors"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="text-xs font-mono text-[#71717A]">
              +{project.tags.length - 4}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
          <div className="flex items-center gap-3">
            {project.stars && project.stars > 0 && (
              <span className="text-xs text-[#71717A] flex items-center gap-1">
                <span className="text-[#F59E0B]">★</span> {project.stars}
              </span>
            )}
          </div>

          <span className={`text-xs font-medium px-2 py-1 rounded border ${statusColors[project.status]}`}>
            {statusLabels[project.status]}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
