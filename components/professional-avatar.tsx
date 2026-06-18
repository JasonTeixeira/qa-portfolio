import Image from 'next/image'

interface ProfessionalAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showGlow?: boolean
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
}

const imageSizes = {
  sm: 48,
  md: 80,
  lg: 128,
  xl: 192,
}

/**
 * Server component — entrance animation via CSS sage-rise.
 */
export function ProfessionalAvatar({ size = 'lg', showGlow = true }: ProfessionalAvatarProps) {
  return (
    <div className="sage-rise relative">
      {/* Glow effect */}
      {showGlow && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#3D5AFE]/30 to-[#E85D3A]/30 rounded-full blur-2xl animate-pulse" />
      )}

      {/* Avatar container */}
      <div
        className={`
          relative ${sizeClasses[size]} rounded-full
          bg-gradient-to-br from-[#3D5AFE] to-[#E85D3A]
          flex items-center justify-center
          ring-4 ring-[#2A2826]
          shadow-xl shadow-[#3D5AFE]/20
          overflow-hidden
        `}
      >
        {/* Headshot image */}
        <Image
          src="/images/headshot.jpg"
          alt="Jason Teixeira"
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="object-cover w-full h-full rounded-full"
          priority={size === 'xl'}
        />
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-1 right-1 w-4 h-4">
        <span className="absolute inset-0 rounded-full bg-[#10B981] status-dot" />
        <span className="absolute inset-0.5 rounded-full bg-[#10B981]" />
      </div>
    </div>
  )
}
