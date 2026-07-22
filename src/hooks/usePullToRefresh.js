import { useState, useRef, useEffect, useCallback } from 'react';

const THRESHOLD = 72;
const MAX_PULL = 100;

export function usePullToRefresh(onRefresh, containerRef) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(null);
  const pullingRef = useRef(false);

  const handleTouchStart = useCallback((e) => {
    const el = containerRef?.current;
    if (!el) return;
    if (el.scrollTop > 0) return;
    startYRef.current = e.touches[0].clientY;
    pullingRef.current = true;
  }, [containerRef]);

  const handleTouchMove = useCallback((e) => {
    if (!pullingRef.current || startYRef.current === null) return;
    const el = containerRef?.current;
    if (!el) return;
    if (el.scrollTop > 0) {
      startYRef.current = null;
      pullingRef.current = false;
      setPullDistance(0);
      return;
    }
    const dy = e.touches[0].clientY - startYRef.current;
    if (dy <= 0) { setPullDistance(0); return; }
    // rubber-band resistance
    const clamped = Math.min(dy * 0.45, MAX_PULL);
    setPullDistance(clamped);
    if (clamped > 0) e.preventDefault();
  }, [containerRef]);

  const handleTouchEnd = useCallback(async () => {
    if (!pullingRef.current) return;
    pullingRef.current = false;
    startYRef.current = null;
    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      setPullDistance(0);
      try { await onRefresh(); } finally { setRefreshing(false); }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, onRefresh]);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, containerRef]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  return { pullDistance, refreshing, progress };
}