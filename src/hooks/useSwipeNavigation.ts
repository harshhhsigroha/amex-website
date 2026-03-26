import { useRef, useCallback, useEffect } from 'react';

interface UseSwipeNavigationOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
  enabled?: boolean;
}

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  enabled = true,
}: UseSwipeNavigationOptions) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number } | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    touchEnd.current = { x: e.targetTouches[0].clientX };
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;
    const dx = touchStart.current.x - touchEnd.current.x;
    if (Math.abs(dx) > threshold) {
      if (dx > 0) onSwipeLeft();
      else onSwipeRight();
    }
    touchStart.current = null;
    touchEnd.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled, onTouchStart, onTouchMove, onTouchEnd]);
}
