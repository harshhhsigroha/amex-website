import * as React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'amber' | 'blue' | 'violet' | 'red' | 'teal' | 'rose' | 'indigo' | 'sky' | 'orange';
  progressWidth?: number;
  className?: string;
  trend?: { value: number; label: string };
}

const colorMap: Record<NonNullable<KpiCardProps['color']>, {
  bg: string; icon: string; bar: string; barFill: string; border: string; glow: string; accent: string;
}> = {
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-500', bar: 'bg-emerald-500/15', barFill: 'bg-emerald-500', border: 'border-emerald-500/15', glow: 'group-hover:shadow-emerald-500/10', accent: 'from-emerald-500/20' },
  amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-500',   bar: 'bg-amber-500/15',   barFill: 'bg-amber-500',   border: 'border-amber-500/15',   glow: 'group-hover:shadow-amber-500/10',   accent: 'from-amber-500/20'   },
  blue:    { bg: 'bg-blue-500/10',    icon: 'text-blue-500',    bar: 'bg-blue-500/15',    barFill: 'bg-blue-500',    border: 'border-blue-500/15',    glow: 'group-hover:shadow-blue-500/10',    accent: 'from-blue-500/20'    },
  violet:  { bg: 'bg-violet-500/10',  icon: 'text-violet-500',  bar: 'bg-violet-500/15',  barFill: 'bg-violet-500',  border: 'border-violet-500/15',  glow: 'group-hover:shadow-violet-500/10',  accent: 'from-violet-500/20'  },
  red:     { bg: 'bg-red-500/10',     icon: 'text-red-500',     bar: 'bg-red-500/15',     barFill: 'bg-red-500',     border: 'border-red-500/15',     glow: 'group-hover:shadow-red-500/10',     accent: 'from-red-500/20'     },
  teal:    { bg: 'bg-teal-500/10',    icon: 'text-teal-500',    bar: 'bg-teal-500/15',    barFill: 'bg-teal-500',    border: 'border-teal-500/15',    glow: 'group-hover:shadow-teal-500/10',    accent: 'from-teal-500/20'    },
  rose:    { bg: 'bg-rose-500/10',    icon: 'text-rose-500',    bar: 'bg-rose-500/15',    barFill: 'bg-rose-500',    border: 'border-rose-500/15',    glow: 'group-hover:shadow-rose-500/10',    accent: 'from-rose-500/20'    },
  indigo:  { bg: 'bg-indigo-500/10',  icon: 'text-indigo-500',  bar: 'bg-indigo-500/15',  barFill: 'bg-indigo-500',  border: 'border-indigo-500/15',  glow: 'group-hover:shadow-indigo-500/10',  accent: 'from-indigo-500/20'  },
  sky:     { bg: 'bg-sky-500/10',     icon: 'text-sky-500',     bar: 'bg-sky-500/15',     barFill: 'bg-sky-500',     border: 'border-sky-500/15',     glow: 'group-hover:shadow-sky-500/10',     accent: 'from-sky-500/20'     },
  orange:  { bg: 'bg-orange-500/10',  icon: 'text-orange-500',  bar: 'bg-orange-500/15',  barFill: 'bg-orange-500',  border: 'border-orange-500/15',  glow: 'group-hover:shadow-orange-500/10',  accent: 'from-orange-500/20'  },
};

export function KpiCard({ label, value, sub, icon: Icon, color, progressWidth, className, trend }: KpiCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn(
      'group relative overflow-hidden rounded-2xl text-card-foreground glass-card',
      'hover:shadow-lg transition-all duration-300 cursor-default',
      c.glow,
      className
    )}>
      {/* Accent gradient overlay */}
      <div className={cn('absolute inset-0 bg-gradient-to-br to-transparent opacity-50 pointer-events-none', c.accent)} />

      <div className="relative p-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">{label}</p>
            <p className="text-2xl font-extrabold text-foreground tabular-nums leading-none">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={cn(
            'p-3 rounded-xl shrink-0',
            'group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300',
            c.bg, 'backdrop-blur-sm'
          )}>
            <Icon className={cn('h-5 w-5', c.icon)} />
          </div>
        </div>

        {trend && (
          <div className={cn(
            'mt-3 flex items-center gap-1 text-xs font-semibold',
            trend.value >= 0 ? 'text-emerald-500' : 'text-red-500'
          )}>
            {trend.value >= 0
              ? <TrendingUp className="h-3 w-3" />
              : <TrendingDown className="h-3 w-3" />
            }
            <span>{Math.abs(trend.value)}% {trend.label}</span>
          </div>
        )}
      </div>

      {progressWidth !== undefined && (
        <div className={cn('h-1 mx-5 mb-4 rounded-full', c.bar)}>
          <div
            className={cn('h-full rounded-full transition-all duration-700 ease-out', c.barFill)}
            style={{ width: `${Math.max(2, Math.min(100, progressWidth))}%` }}
          />
        </div>
      )}
    </div>
  );
}
