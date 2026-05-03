import * as React from 'react';
import { cn, initials } from '@/lib/utils';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name: string;
  size?: number;
}

export function Avatar({ src, name, size = 40, className, ...props }: Props) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-[#27272a] border border-[#3f3f46] overflow-hidden text-[#a1a1aa] font-medium select-none shrink-0',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
