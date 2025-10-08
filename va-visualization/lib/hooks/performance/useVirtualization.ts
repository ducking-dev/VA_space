/**
 * @file useVirtualization.ts
 * @description 대량 데이터 가상화 렌더링 Hook
 * @principle Single Responsibility - 가상화 로직만 담당
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { IViewport } from '@/lib/types/visualization.types';
import type { IRenderablePoint } from '@/lib/types/emotion.types';
import { VIRTUALIZATION_CONFIG } from '@/lib/constants/visualization.const';
import { isPointInViewport } from '@/lib/utils/math/geometry.util';

/**
 * useVirtualization 반환 타입
 */
export interface IUseVirtualizationReturn<T> {
  visibleItems: T[];
  totalItems: number;
  visibleCount: number;
  isVirtualized: boolean;
}

/**
 * 가상화 렌더링 Hook
 */
export function useVirtualization<T extends IRenderablePoint>(
  items: T[],
  viewport: IViewport,
  enabled: boolean = true
): IUseVirtualizationReturn<T> {
  const totalItems = items.length;
  const shouldVirtualize = enabled && totalItems > VIRTUALIZATION_CONFIG.THRESHOLD;

  const visibleItems = useMemo(() => {
    if (!shouldVirtualize) {
      return items;
    }

    // 뷰포트 + overscan 영역 계산
    const overscan = VIRTUALIZATION_CONFIG.OVERSCAN;
    const expandedViewport = {
      ...viewport,
      x: viewport.x - overscan,
      y: viewport.y - overscan,
      width: viewport.width + overscan * 2,
      height: viewport.height + overscan * 2,
    };

    // 뷰포트 내 아이템만 필터링
    return items.filter((item) =>
      isPointInViewport({ x: item.x, y: item.y }, expandedViewport)
    );
  }, [items, viewport, shouldVirtualize]);

  return {
    visibleItems,
    totalItems,
    visibleCount: visibleItems.length,
    isVirtualized: shouldVirtualize,
  };
}

/**
 * 청크 기반 렌더링 Hook
 */
export interface IUseChunkedRenderReturn<T> {
  currentChunk: T[];
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  progress: number;
}

export function useChunkedRender<T>(
  items: T[],
  chunkSize: number = VIRTUALIZATION_CONFIG.CHUNK_SIZE
): IUseChunkedRenderReturn<T> {
  const [loadedCount, setLoadedCount] = useState(chunkSize);

  const currentChunk = useMemo(() => {
    return items.slice(0, loadedCount);
  }, [items, loadedCount]);

  const hasMore = loadedCount < items.length;

  const progress = items.length > 0 ? loadedCount / items.length : 1;

  const loadMore = useCallback(() => {
    setLoadedCount((prev) => Math.min(prev + chunkSize, items.length));
  }, [items.length, chunkSize]);

  const reset = useCallback(() => {
    setLoadedCount(chunkSize);
  }, [chunkSize]);

  // 아이템 배열이 변경되면 리셋
  useEffect(() => {
    reset();
  }, [items, reset]);

  return {
    currentChunk,
    hasMore,
    loadMore,
    reset,
    progress,
  };
}

/**
 * 무한 스크롤 Hook
 */
export function useInfiniteScroll(
  hasMore: boolean,
  loadMore: () => void,
  threshold: number = 0.8
): void {
  useEffect(() => {
    if (!hasMore) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      const scrollPercentage = (scrolled + viewportHeight) / fullHeight;

      if (scrollPercentage >= threshold) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loadMore, threshold]);
}

/**
 * 디바운스 Hook
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 스로틀 Hook
 */
export function useThrottle<T>(value: T, limit: number = 100): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * RAF (RequestAnimationFrame) Hook
 */
export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  enabled: boolean = true
): void {
  const callbackRef = useRef(callback);
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const animate = (time: number) => {
      if (lastTimeRef.current !== undefined) {
        const deltaTime = time - lastTimeRef.current;
        callbackRef.current(deltaTime);
      }
      lastTimeRef.current = time;
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [enabled]);
}

// useRef import 추가
import { useRef } from 'react';


