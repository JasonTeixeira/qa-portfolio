import {
  Sparkles,
  Database,
  Shield,
  Zap,
  Bot,
  BookOpen,
  Search,
  Wrench,
  Workflow,
  BarChart3,
  FileText,
  Megaphone,
  Palette,
  Code2,
  Cpu,
  Cloud,
  CreditCard,
  Lock,
  Mic,
  Headphones,
  Users,
  Phone,
  TrendingUp,
  Target,
  Lightbulb,
  Briefcase,
  Bug,
  AlertTriangle,
  GitBranch,
  Bell,
  Inbox,
  Brush,
  Globe,
  Package,
  Building2,
  Brain,
  Compass,
  Activity,
  type LucideIcon,
} from 'lucide-react'
import type { LucideIconName } from '@/data/services/visual-meta'

const map: Record<LucideIconName, LucideIcon> = {
  Sparkles,
  Database,
  Shield,
  Zap,
  Bot,
  BookOpen,
  Search,
  Wrench,
  Workflow,
  BarChart3,
  FileText,
  Megaphone,
  Palette,
  Code2,
  Cpu,
  Cloud,
  CreditCard,
  Lock,
  Mic,
  Headphones,
  Users,
  Phone,
  TrendingUp,
  Target,
  Lightbulb,
  Briefcase,
  Bug,
  AlertTriangle,
  GitBranch,
  Bell,
  Inbox,
  Brush,
  Globe,
  Package,
  Building2,
  Brain,
  Compass,
  Activity,
}

export function getServiceIcon(name: LucideIconName): LucideIcon {
  return map[name] ?? Sparkles
}

export function ServiceIcon({
  name,
  className,
}: {
  name: LucideIconName
  className?: string
}) {
  const Cmp = map[name] ?? Sparkles
  return <Cmp className={className} />
}
