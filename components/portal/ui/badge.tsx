import * as React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';

const tones: Record<Tone, string> = {
  neutral: 'bg-[#27272a] text-[#a1a1aa] border-[#3f3f46]',
  cyan: 'bg-[#06b6d4]/10 text-[#22d3ee] border-[#06b6d4]/30',
  emerald: 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30',
  amber: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30',
  rose: 'bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/30',
  violet: 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/30',
};

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = 'neutral', className, ...props }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
