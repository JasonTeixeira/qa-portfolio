import { supabaseAdmin } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { scoreLead } from './scoring';

export type LeadSource = 'contact' | 'newsletter' | 'seo_audit' | 'checkout';

export type LeadInput = {
  source: LeadSource;
  email: string | null;
  name: string | null;
  detail: string;
  inquiryType?: string;
  budget?: string;
  amountCents?: number | null;
  metadata?: Record<string, unknown>;
  /** Set to false to skip the operator notification email (persist-only). Default: true. */
  notify?: boolean;
};

/**
 * Persist a lead to the `leads` table and fire a lightweight notification email.
 * Both operations are best-effort: errors are logged but never surfaced to the
 * caller. Wire this into any lead-generating route (contact form, newsletter
 * signup, checkout, etc.) without worrying about degrading the happy path.
 */
export async function captureLead(input: LeadInput): Promise<void> {
  const scoring = scoreLead(input);
  const metadata = {
    ...(input.metadata ?? {}),
    lead_score: scoring.score,
    lead_score_reasons: scoring.reasons,
  };

  // Persist — supabaseAdmin() uses service-role key and bypasses RLS.
  // It throws if env vars are absent; that throw is caught here so the
  // caller's happy path is never affected.
  try {
    const sb = supabaseAdmin();
    const { error } = await sb.from('leads').insert({
      source:       input.source,
      email:        input.email,
      name:         input.name,
      detail:       input.detail,
      inquiry_type: input.inquiryType ?? null,
      budget:       input.budget ?? null,
      amount_cents: input.amountCents ?? null,
      metadata,
    });
    if (error) {
      console.error('[captureLead] persist error:', error.message);
    }
  } catch (e) {
    console.error('[captureLead] persist failed:', e);
  }

  // Notify — only when enabled (default true) and we have an API key + reply-to address.
  try {
    const key = process.env.RESEND_API_KEY;
    if ((input.notify !== false) && key && input.email) {
      const { error } = await new Resend(key).emails.send({
        from:    'Sage Ideas Leads <leads@sageideas.dev>',
        to:      'sage@sageideas.dev',
        replyTo: input.email,
        subject: `New ${input.source} lead`,
        text: [
          input.detail,
          `Email: ${input.email}`,
          `Name: ${input.name ?? '—'}`,
          input.inquiryType ? `Inquiry type: ${input.inquiryType}` : '',
          input.budget ? `Budget: ${input.budget}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      });
      if (error) {
        console.error('[captureLead] notify error:', error.message);
      }
    }
  } catch (e) {
    console.error('[captureLead] notify failed:', e);
  }
}
