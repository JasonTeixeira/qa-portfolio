import { TabBar, type Tab } from './TabBar'

/**
 * Secondary navigation for a grouped academy destination. The top nav collapsed
 * several flat items into two grouped destinations — "Compete" and "Progress" —
 * and this bar surfaces the sibling pages of whichever group the learner is in.
 * Renders directly under the main header as a hairline-ruled secondary bar.
 */
export type GroupKey = 'compete' | 'progress'

const GROUP_TABS: Record<GroupKey, readonly Tab[]> = {
  compete: [
    { href: '/academy/leagues', label: 'Leagues', key: 'leagues' },
    { href: '/academy/community', label: 'Community', key: 'community' },
  ],
  progress: [
    { href: '/academy/profile', label: 'Mastery', key: 'mastery' },
    { href: '/academy/evidence', label: 'Certificates', key: 'certificates' },
    { href: '/academy/efficacy', label: 'Efficacy', key: 'efficacy' },
    { href: '/academy/refer', label: 'Invite', key: 'refer' },
  ],
}

const GROUP_LABEL: Record<GroupKey, string> = {
  compete: 'Compete sections',
  progress: 'Progress sections',
}

export function GroupSubNav({ group, tab }: { group: GroupKey; tab: string }) {
  const tabs = GROUP_TABS[group]
  return (
    <div className="mx-auto max-w-6xl px-5 pt-4 sm:px-8">
      <TabBar tabs={tabs} active={tab} ariaLabel={GROUP_LABEL[group]} />
    </div>
  )
}
