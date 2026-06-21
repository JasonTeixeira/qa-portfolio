'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { recordDiscordEvent } from '@/lib/discord/analytics';
import { reviewDiscordContentDraft } from '@/lib/discord/content-approval';
import { reviewMemberApplication } from '@/lib/discord/engagement';
import { approveDiscordMember } from '@/lib/discord/onboarding';
import { postToChannelByBaseName } from '@/lib/discord/sage-rest';

function value(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

export async function approveDiscordApplication(formData: FormData) {
  const { user, profile } = await requireAdmin();
  const discordUserId = value(formData, 'discord_user_id');
  const username = value(formData, 'discord_username') || discordUserId;
  const note = value(formData, 'note');
  if (!discordUserId) throw new Error('Missing Discord user id.');

  const result = await reviewMemberApplication({
    discordUserId,
    status: 'approved',
    reviewerDiscordUserId: user.id,
    reviewerUsername: profile.email,
    note: note || null,
  });
  if (!result.ok) throw new Error(`Could not approve application: ${result.reason ?? 'unknown error'}`);

	  await approveDiscordMember({
	    discordUserId,
	    username: result.application?.username ?? username,
	    reviewer: profile.email,
	    commandName: 'admin_dashboard',
	    application: result.application ?? null,
	  });
  revalidatePath('/admin/discord');
}

export async function rejectDiscordApplication(formData: FormData) {
  const { user, profile } = await requireAdmin();
  const discordUserId = value(formData, 'discord_user_id');
  const username = value(formData, 'discord_username') || discordUserId;
  const note = value(formData, 'note');
  if (!discordUserId) throw new Error('Missing Discord user id.');

  const result = await reviewMemberApplication({
    discordUserId,
    status: 'rejected',
    reviewerDiscordUserId: user.id,
    reviewerUsername: profile.email,
    note: note || null,
  });
  if (!result.ok) throw new Error(`Could not reject application: ${result.reason ?? 'unknown error'}`);

  await postToChannelByBaseName(
    'team-ops',
    `Rejected <@${discordUserId}> application from admin dashboard. Reviewer: ${profile.email}. ${note ? `Note: ${note}` : ''}`,
  );
  await recordDiscordEvent({
    eventType: 'member_application_rejected',
    commandName: 'admin_dashboard',
    discordUserId,
    discordUsername: username,
    channelBaseName: 'team-ops',
    metadata: { reviewer: profile.email, note: note || null },
  });
  revalidatePath('/admin/discord');
}

export async function updateDiscordContentQueueStatus(formData: FormData) {
  const { profile } = await requireAdmin();
  const id = value(formData, 'id');
  const status = value(formData, 'status');
  const allowed = new Set(['captured', 'triaged', 'drafted', 'published', 'archived']);
  if (!id || !allowed.has(status)) throw new Error('Invalid content queue update.');

  const { error } = await supabaseAdmin()
    .from('discord_content_queue')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);

	await recordDiscordEvent({
	  eventType: 'content_queue_status_updated',
	  commandName: 'admin_dashboard',
	  channelBaseName: 'questions',
    metadata: { id, status, reviewer: profile.email },
  });
  revalidatePath('/admin/discord');
}

export async function reviewDiscordContentDraftAction(formData: FormData) {
  const { user, profile } = await requireAdmin();
  const id = value(formData, 'id');
  const status = value(formData, 'status');
  const note = value(formData, 'note');
  if (!id || !['approved', 'rejected', 'archived'].includes(status)) throw new Error('Invalid content draft review.');

  await reviewDiscordContentDraft({
    draftId: id,
    status: status as 'approved' | 'rejected' | 'archived',
    reviewerUserId: user.id,
    reviewerEmail: profile.email,
    note: note || null,
  });
  await recordDiscordEvent({
    eventType: 'content_draft_reviewed',
    commandName: 'admin_dashboard',
    channelBaseName: 'team-ops',
    metadata: { id, status, reviewer: profile.email, note: note || null },
  });
  revalidatePath('/admin/discord');
}
