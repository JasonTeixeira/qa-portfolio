'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[#06b6d4] text-[#09090b] hover:bg-[#22d3ee] active:bg-[#0891b2] font-medium shadow-[0_0_0_1px_rgba(6,182,212,0.4),0_8px_24px_-8px_rgba(6,182,212,0.6)]',
  secondary:
    'bg-[#27272a] text-[#fafafa] hover:bg-[#3f3f46] border border-[#3f3f46]',
  ghost: 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b]',
  outline:
    'border border-[#3f3f46] text-[#fafafa] hover:bg-[#18181b] hover:border-[#52525b]',
  danger: 'bg-[#ef4444] text-white hover:bg-[#dc2626]',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-lg',
  icon: 'h-10 w-10 rounded-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-[#06b6d4]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
