import type { MemberApplicationProfile } from './engagement';

export type NativeApprovalSyncMember = {
  discordUserId: string;
  username: string | null;
  bot: boolean;
  pending: boolean | null;
  privileged: boolean;
  approvedInDatabase: boolean;
  hasAcademyRole: boolean;
  pendingApplication: MemberApplicationProfile | null;
};

export type NativeApprovalSyncAction =
  | {
    type: 'skip';
    discordUserId: string;
    username: string | null;
    reason: 'bot' | 'privileged' | 'pending_native_screening' | 'already_approved' | 'unknown_native_state';
  }
  | {
    type: 'approve_from_application';
    discordUserId: string;
    username: string | null;
    application: MemberApplicationProfile;
  }
  | {
    type: 'approve_native_default';
    discordUserId: string;
    username: string | null;
    application: MemberApplicationProfile;
  };

export function buildNativeDefaultApplicationProfile(input: {
  discordUserId: string;
  username: string | null;
}): MemberApplicationProfile {
  return {
    discordUserId: input.discordUserId,
    username: input.username,
    goal: 'Approved through Discord native member application.',
    experience: 'Captured through Discord native screening.',
    intendedBuild: 'Choose a first project in Sage Ideas onboarding.',
    pathKey: null,
    levelKey: 'starting',
    timezone: null,
    weeklyTimeBudget: null,
    primaryGoal: 'Complete Sage Ideas Academy onboarding.',
    preferredSupport: 'questions',
    portfolioUrl: null,
    referralSource: 'discord_native_application',
    submittedAt: new Date().toISOString(),
  };
}

export function planNativeApprovalSync(members: NativeApprovalSyncMember[]): NativeApprovalSyncAction[] {
  return members.map((member) => {
    if (member.bot) {
      return { type: 'skip', discordUserId: member.discordUserId, username: member.username, reason: 'bot' };
    }
    if (member.privileged) {
      return { type: 'skip', discordUserId: member.discordUserId, username: member.username, reason: 'privileged' };
    }
    if (member.pending === true) {
      return { type: 'skip', discordUserId: member.discordUserId, username: member.username, reason: 'pending_native_screening' };
    }
    if (member.pending !== false) {
      return { type: 'skip', discordUserId: member.discordUserId, username: member.username, reason: 'unknown_native_state' };
    }
    if (member.approvedInDatabase && member.hasAcademyRole) {
      return { type: 'skip', discordUserId: member.discordUserId, username: member.username, reason: 'already_approved' };
    }
    if (member.pendingApplication) {
      return {
        type: 'approve_from_application',
        discordUserId: member.discordUserId,
        username: member.username,
        application: member.pendingApplication,
      };
    }
    return {
      type: 'approve_native_default',
      discordUserId: member.discordUserId,
      username: member.username,
      application: buildNativeDefaultApplicationProfile({
        discordUserId: member.discordUserId,
        username: member.username,
      }),
    };
  });
}
