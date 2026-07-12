'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

const leadStatusSchema = z.enum(['new', 'reviewed', 'qualified', 'nurture', 'won', 'lost', 'spam']);

export async function updateLeadDisposition(formData: FormData) {
  await requireAdmin();

  const id = z.string().uuid().parse(formData.get('id'));
  const status = leadStatusSchema.parse(formData.get('status'));
  const ownerNotes = z
    .string()
    .max(2000)
    .optional()
    .parse(String(formData.get('owner_notes') ?? '').trim() || undefined);

  const { error } = await supabaseAdmin()
    .from('leads')
    .update({
      status,
      owner_notes: ownerNotes ?? null,
    })
    .eq('id', id);

  if (error) throw new Error(`Unable to update lead: ${error.message}`);
  revalidatePath('/admin/leads');
}
