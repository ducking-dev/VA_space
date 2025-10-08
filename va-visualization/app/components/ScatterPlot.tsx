/**
 * @file ScatterPlot.tsx
 * @description 감정 데이터 산점도 컴포넌트
 * @principle Presentation Component - 시각화만 담당
 */

'use client';

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { IRenderablePoint } from '@/lib/types/emotion.types';
import { POINT_SIZE, POINT_OPACITY, ANIMATION_DURATION } from '@/lib/constants/visualization.const';
import { getConfidenceColor } from '@/lib/constants/colors.const';

// ============================================================================
// Individual Point Component
// ============================================================================

interface IPointProps {
  point: IRenderablePoint;
  index: number;
  isHovered: boolean;
  onHover: (point: IRenderablePoint | null) => void;
}

const Point = memo<IPointProps>(({ point, index, isHovered, onHover }) => {
  const size = isHovered ? POINT_SIZE.HOVERED : (point.isMultiword ? POINT_SIZE.MULTIWORD : POINT_SIZE.DEFAULT);
  const opacity = isHovered ? POINT_OPACITY.HOVERED : POINT_OPACITY.DEFAULT;

  return (
    <motion.circle
      cx={point.valence}
      cy={point.arousal}
      r={size / 1000} // SVG 좌표계 스케일 조정
      fill={point.color}
      opacity={opacity}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity }}
      transition={{
        duration: ANIMATION_DURATION.FAST / 1000,
        delay: index * 0.0001,
        ease: 'easeOut',
      }}
      whileHover={{
        scale: 1.5,
        opacity: 1,
      }}
      onMouseEnter={() => onHover(point)}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer transition-all"
      style={{
        transformOrigin: `${point.valence}px ${point.arousal}px`,
      }}
    />
  );
});

Point.displayName = 'Point';

// ============================================================================
// ScatterPlot Component
// ============================================================================

export interface IScatterPlotProps {
  points: IRenderablePoint[];
  onHover?: (point: IRenderablePoint | null) => void;
  hoveredPoint?: IRenderablePoint | null;
  maxPoints?: number;
  isPartial?: boolean; // 데이터가 부분적으로 로드된 상태인지 여부
}

/**
 * 산점도 컴포넌트
 */
export const ScatterPlot = memo<IScatterPlotProps>(({
  points,
  onHover,
  hoveredPoint,
  maxPoints = 10000,
  isPartial = false,
}) => {
  // 성능 최적화: 포인트 수 제한
  const visiblePoints = useMemo(() => {
    if (points.length <= maxPoints) {
      return points;
    }
    // 샘플링
    const step = Math.ceil(points.length / maxPoints);
    return points.filter((_, index) => index % step === 0);
  }, [points, maxPoints]);

  const handleHover = useMemo(
    () => onHover || (() => {}),
    [onHover]
  );

  return (
    <g 
      className="scatter-plot"
      style={{ 
        opacity: isPartial ? 0.7 : 1,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      {visiblePoints.map((point, index) => (
        <Point
          key={`${point.term}-${index}`}
          point={point}
          index={index}
          isHovered={hoveredPoint?.term === point.term}
          onHover={handleHover}
        />
      ))}
    </g>
  );
});

ScatterPlot.displayName = 'ScatterPlot';

// ============================================================================
// Optimized ScatterPlot with Virtualization
// ============================================================================

export interface IVirtualizedScatterPlotProps extends IScatterPlotProps {
  viewport: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

/**
 * 가상화된 산점도 (대량 데이터용)
 */
export const VirtualizedScatterPlot = memo<IVirtualizedScatterPlotProps>(({
  points,
  viewport,
  onHover,
  hoveredPoint,
}) => {
  // 뷰포트 내 포인트만 렌더링
  const visiblePoints = useMemo(() => {
    return points.filter(point =>
      point.valence >= viewport.minX &&
      point.valence <= viewport.maxX &&
      point.arousal >= viewport.minY &&
      point.arousal <= viewport.maxY
    );
  }, [points, viewport]);

  return (
    <ScatterPlot
      points={visiblePoints}
      onHover={onHover}
      hoveredPoint={hoveredPoint}
    />
  );
});

VirtualizedScatterPlot.displayName = 'VirtualizedScatterPlot';
