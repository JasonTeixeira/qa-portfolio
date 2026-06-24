export type ApprovedMemberOnboardingNudgeMember = {
  discordUserId: string;
  username: string | null;
  academyMember: boolean;
  pathKey: string | null;
  levelKey: string | null;
};

export type ApprovedMemberOnboardingNudgeTarget = ApprovedMemberOnboardingNudgeMember & {
  reason: 'approved_default_route';
};

export type ApprovedMemberOnboardingNudgeSkip = ApprovedMemberOnboardingNudgeMember & {
  reason: 'not_approved' | 'already_routed' | 'recently_nudged';
};

export type ApprovedMemberOnboardingNudgePlan = {
  targets: ApprovedMemberOnboardingNudgeTarget[];
  skipped: ApprovedMemberOnboardingNudgeSkip[];
};

export function isApprovedDefaultRoute(member: ApprovedMemberOnboardingNudgeMember): boolean {
  return member.academyMember === true && !member.pathKey && member.levelKey === 'starting';
}

export function planApprovedMemberOnboardingNudges(
  members: ApprovedMemberOnboardingNudgeMember[],
  recentlyNudgedUserIds: Set<string> = new Set(),
): ApprovedMemberOnboardingNudgePlan {
  const targets: ApprovedMemberOnboardingNudgeTarget[] = [];
  const skipped: ApprovedMemberOnboardingNudgeSkip[] = [];

  for (const member of members) {
    if (!member.academyMember) {
      skipped.push({ ...member, reason: 'not_approved' });
      continue;
    }
    if (!isApprovedDefaultRoute(member)) {
      skipped.push({ ...member, reason: 'already_routed' });
      continue;
    }
    if (recentlyNudgedUserIds.has(member.discordUserId)) {
      skipped.push({ ...member, reason: 'recently_nudged' });
      continue;
    }
    targets.push({ ...member, reason: 'approved_default_route' });
  }

  return { targets, skipped };
}

export function buildApprovedMemberOnboardingNudgeContent(targets: ApprovedMemberOnboardingNudgeTarget[]): string {
  const mentions = targets.map((target) => `<@${target.discordUserId}>`).join(' ');
  return [
    '# Finish your Sage Ideas setup',
    '',
    mentions,
    '',
    'You already have free member access. Run `/onboard` and choose your path and level so SageBot can route prompts, reviews, challenges, and resources correctly.',
    '',
    'After `/onboard`, run `/checklist` and complete your first-week setup.',
  ].join('\n');
}
