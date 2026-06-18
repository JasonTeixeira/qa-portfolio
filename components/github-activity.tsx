'use client'

import { motion } from 'framer-motion'
import { GitCommit, GitPullRequest, Star, FolderGit2 } from 'lucide-react'

/**
 * Live-feel GitHub activity strip.
 * Data is sourced from data/github-stats.ts at build time — not API calls.
 * The animated counters and green dot create a "live system" feeling.
 */
// Verifiable facts only (honesty guardrail). github.com/JasonTeixeira.
const stats = [
  { icon: FolderGit2, value: '130+', label: 'Public repos' },
  { icon: Star, value: '6', label: 'Live products' },
  { icon: GitPullRequest, value: '8', label: 'Case studies' },
  { icon: GitCommit, value: '2020', label: 'Shipping since' },
]

export function GitHubActivity() {
  return (
    <div className="flex flex-wrap items-center gap-6 lg:gap-8">
      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3D5AFE] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3D5AFE]" />
        </span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
          Open on GitHub
        </span>
      </div>

      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
        >
          <stat.icon className="w-3.5 h-3.5 text-[#3D5AFE]" />
          <span className="text-sm font-semibold text-[#F4F2EF] tabular-nums">
            {stat.value}
          </span>
          <span className="text-xs text-[#78716C]">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  )
}
