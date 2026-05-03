import { cn } from '@/lib/utils';

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-[#27272a]', className)}>
      <div
        className="h-full bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
