import { useState, useRef, useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isTouching = useRef(false);

  const THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    isTouching.current = true;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTouching.current || refreshing) return;
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) {
      setPullDistance(0);
      setPulling(false);
      return;
    }

    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      e.preventDefault();
      const distance = Math.min(delta * 0.5, MAX_PULL);
      setPullDistance(distance);
      setPulling(true);
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    isTouching.current = false;
    if (!pulling) return;

    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      setPullDistance(THRESHOLD * 0.6);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPullDistance(0);
    setPulling(false);
  }, [pulling, pullDistance, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center z-10 pointer-events-none transition-opacity duration-200"
        style={{
          top: -4,
          height: `${pullDistance}px`,
          opacity: pulling || refreshing ? 1 : 0,
        }}
      >
        <div
          className={cn(
            'h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm transition-transform',
            refreshing && 'animate-spin'
          )}
          style={{
            transform: refreshing ? undefined : `rotate(${progress * 360}deg) scale(${0.5 + progress * 0.5})`,
          }}
        >
          <RefreshCw className="h-4 w-4 text-primary" />
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transitionDuration: pulling ? '0ms' : '300ms',
        }}
      >
        {children}
      </div>
    </div>
  );
}
