'use client'

import Image from 'next/image'
import { useState } from 'react'

const CATEGORY_GRADIENTS: Record<string, string> = {
  Architecture: 'from-cyan-500/30 via-blue-500/20 to-violet-500/20',
  Engineering: 'from-cyan-500/30 via-cyan-700/20 to-zinc-800/30',
  Career: 'from-emerald-500/30 via-teal-500/20 to-cyan-500/20',
  'Cloud Automation': 'from-amber-500/30 via-orange-500/20 to-rose-500/20',
  Trading: 'from-violet-500/30 via-fuchsia-500/20 to-rose-500/20',
  Testing: 'from-rose-500/30 via-pink-500/20 to-orange-500/20',
  Security: 'from-red-500/30 via-amber-500/20 to-yellow-500/20',
  DevOps: 'from-sky-500/30 via-indigo-500/20 to-violet-500/20',
  AI: 'from-fuchsia-500/30 via-violet-500/20 to-cyan-500/20',
}

interface PostCoverProps {
  src?: string
  alt: string
  category: string
  className?: string
  sizes?: string
  priority?: boolean
}

export function PostCover({
  src,
  alt,
  category,
  className = '',
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
}: PostCoverProps) {
  const [errored, setErrored] = useState(false)
  const showImage = src && !errored
  const gradient = CATEGORY_GRADIENTS[category] ?? 'from-[#06B6D4]/25 via-[#0F0F12] to-[#8B5CF6]/25'

  return (
    <div className={`relative overflow-hidden bg-[#0A0A0C] ${className}`}>
      {showImage ? (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#FAFAFA]/80 px-3 py-1 rounded-full bg-[#09090B]/60 border border-[#FAFAFA]/10 backdrop-blur-sm">
            {category}
          </span>
        </div>
      )}
    </div>
  )
}
