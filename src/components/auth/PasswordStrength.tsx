import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

const rules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character (!@#$...)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const results = useMemo(() => rules.map(r => ({ ...r, passed: r.test(password) })), [password]);
  const passedCount = results.filter(r => r.passed).length;
  const strength = passedCount <= 1 ? 'weak' : passedCount <= 3 ? 'fair' : passedCount <= 4 ? 'good' : 'strong';

  const strengthColors = {
    weak: 'bg-destructive',
    fair: 'bg-orange-500',
    good: 'bg-yellow-500',
    strong: 'bg-emerald-500',
  };

  if (!password) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i <= Math.ceil((passedCount / rules.length) * 4)
                ? strengthColors[strength]
                : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className={cn('text-[10px] font-medium', {
        'text-destructive': strength === 'weak',
        'text-orange-500': strength === 'fair',
        'text-yellow-600': strength === 'good',
        'text-emerald-500': strength === 'strong',
      })}>
        Password strength: {strength}
      </p>
      {/* Rules */}
      <div className="space-y-1">
        {results.map(r => (
          <div key={r.label} className="flex items-center gap-1.5">
            {r.passed ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground/50" />
            )}
            <span className={cn('text-[11px]', r.passed ? 'text-foreground' : 'text-muted-foreground')}>
              {r.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function isPasswordStrong(password: string): boolean {
  return rules.every(r => r.test(password));
}
