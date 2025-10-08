/**
 * @file useHover.ts
 * @description 마우스 Hover 상태 관리 Hook
 * @principle Single Responsibility - Hover 상태만 관리
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useHover 반환 타입
 */
export interface IUseHoverReturn<T> {
  hoveredItem: T | null;
  setHoveredItem: (item: T | null) => void;
  isHovered: (item: T) => boolean;
  clearHover: () => void;
}

/**
 * Hover 상태 관리 Hook
 */
export function useHover<T>(
  delay: number = 0,
  compareKey?: (item: T) => string | number
): IUseHoverReturn<T> {
  const [hoveredItem, setHoveredItemState] = useState<T | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const setHoveredItem = useCallback(
    (item: T | null) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (delay > 0) {
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setHoveredItemState(item);
          }
        }, delay);
      } else {
        setHoveredItemState(item);
      }
    },
    [delay]
  );

  const isHovered = useCallback(
    (item: T): boolean => {
      if (!hoveredItem) return false;

      if (compareKey) {
        return compareKey(item) === compareKey(hoveredItem);
      }

      return item === hoveredItem;
    },
    [hoveredItem, compareKey]
  );

  const clearHover = useCallback(() => {
    setHoveredItem(null);
  }, [setHoveredItem]);

  return {
    hoveredItem,
    setHoveredItem,
    isHovered,
    clearHover,
  };
}

/**
 * 마우스 위치 추적 Hook
 */
export interface IUseMousePositionReturn {
  x: number;
  y: number;
  elementX: number;
  elementY: number;
}

export function useMousePosition(
  elementRef?: React.RefObject<HTMLElement>
): IUseMousePositionReturn {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    elementX: 0,
    elementY: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const newPosition = {
        x: event.clientX,
        y: event.clientY,
        elementX: event.clientX,
        elementY: event.clientY,
      };

      // 요소 상대 좌표 계산
      if (elementRef?.current) {
        const rect = elementRef.current.getBoundingClientRect();
        newPosition.elementX = event.clientX - rect.left;
        newPosition.elementY = event.clientY - rect.top;
      }

      setPosition(newPosition);
    };

    const target = elementRef?.current || window;
    target.addEventListener('mousemove', handleMouseMove as any);

    return () => {
      target.removeEventListener('mousemove', handleMouseMove as any);
    };
  }, [elementRef]);

  return position;
}

/**
 * 요소 Hover 감지 Hook
 */
export function useElementHover(
  elementRef: React.RefObject<HTMLElement>
): boolean {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [elementRef]);

  return isHovered;
}


