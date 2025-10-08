/**
 * @file useViewport.ts
 * @description 뷰포트 관리 및 반응형 Hook
 * @principle Single Responsibility - 뷰포트 상태 관리
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { IViewport } from '@/lib/types/visualization.types';
import { BREAKPOINTS } from '@/lib/constants/visualization.const';

/**
 * useViewport 반환 타입
 */
export interface IUseViewportReturn {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  viewport: IViewport;
}

/**
 * 뷰포트 크기 및 반응형 상태 Hook
 */
export function useViewport(): IUseViewportReturn {
  const [viewport, setViewport] = useState<IViewport>({
    x: 0,
    y: 0,
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 실행

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    width: viewport.width,
    height: viewport.height,
    isMobile: viewport.width < BREAKPOINTS.SM,
    isTablet: viewport.width >= BREAKPOINTS.SM && viewport.width < BREAKPOINTS.LG,
    isDesktop: viewport.width >= BREAKPOINTS.LG && viewport.width < BREAKPOINTS.XXL,
    isLargeDesktop: viewport.width >= BREAKPOINTS.XXL,
    viewport,
  };
}

/**
 * 컨테이너 크기 추적 Hook
 */
export function useContainerSize(
  ref: React.RefObject<HTMLElement>
): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const updateSize = () => {
      if (ref.current) {
        setSize({
          width: ref.current.clientWidth,
          height: ref.current.clientHeight,
        });
      }
    };

    // ResizeObserver 사용
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(ref.current);
    updateSize(); // 초기 실행

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return size;
}

/**
 * 스크롤 위치 추적 Hook
 */
export function useScrollPosition(): {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
} {
  const [scroll, setScroll] = useState({
    x: 0,
    y: 0,
    direction: null as 'up' | 'down' | 'left' | 'right' | null,
  });

  useEffect(() => {
    let lastX = window.scrollX;
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentX = window.scrollX;
      const currentY = window.scrollY;

      let direction: 'up' | 'down' | 'left' | 'right' | null = null;

      if (currentY > lastY) {
        direction = 'down';
      } else if (currentY < lastY) {
        direction = 'up';
      } else if (currentX > lastX) {
        direction = 'right';
      } else if (currentX < lastX) {
        direction = 'left';
      }

      setScroll({
        x: currentX,
        y: currentY,
        direction,
      });

      lastX = currentX;
      lastY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기 실행

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scroll;
}

/**
 * 요소 가시성 감지 Hook (Intersection Observer)
 */
export function useIntersectionObserver(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}


