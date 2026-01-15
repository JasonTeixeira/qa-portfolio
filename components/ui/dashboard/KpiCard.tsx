import type { ReactNode } from 'react';

export function KpiCard(props: {
  title: string;
  value: string;
  sublabel?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="bg-dark-card border border-dark-lighter rounded-lg p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-400">
            {props.title}
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground font-mono">
            {props.value}
          </div>
          {props.sublabel && (
            <div className="mt-1 text-xs text-gray-400">{props.sublabel}</div>
          )}
        </div>

        {props.icon && (
          <div className="text-primary opacity-90">{props.icon}</div>
        )}
      </div>
    </div>
  );
}
