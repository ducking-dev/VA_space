/**
 * @file VAPlane.tsx
 * @description V-A 평면 SVG 컴포넌트
 * @principle Presentation Component - UI 렌더링만 담당
 */

'use client';

import React, { memo } from 'react';
import { VA_COORDINATE_RANGE, CANVAS_PADDING } from '@/lib/constants/visualization.const';
import { GRAY_COLORS, QUADRANT_COLORS } from '@/lib/constants/colors.const';

// ============================================================================
// Grid Background Component
// ============================================================================

const GridBackground = memo(() => {
  return (
    <defs>
      <pattern 
        id="grid" 
        width="0.1" 
        height="0.1" 
        patternUnits="userSpaceOnUse"
      >
        <path 
          d="M 0.1 0 L 0 0 0 0.1"
          fill="none" 
          stroke={GRAY_COLORS[200]} 
          strokeWidth="0.001"
        />
      </pattern>
      
      {/* Quadrant gradient backgrounds */}
      <linearGradient id="quadrant-1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF2CC" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#FFE6B3" stopOpacity="0.3" />
      </linearGradient>
      
      <linearGradient id="quadrant-2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFE6E6" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#FFB3B3" stopOpacity="0.3" />
      </linearGradient>
      
      <linearGradient id="quadrant-3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E6F3FF" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#B3D9FF" stopOpacity="0.3" />
      </linearGradient>
      
      <linearGradient id="quadrant-4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E6FFE6" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#B3FFB3" stopOpacity="0.3" />
      </linearGradient>
    </defs>
  );
});

GridBackground.displayName = 'GridBackground';

// ============================================================================
// Axes Component
// ============================================================================

const Axes = memo(() => {
  const { VALENCE, AROUSAL } = VA_COORDINATE_RANGE;

  return (
    <g className="axes">
      {/* X축 (Valence) */}
      <line
        x1={VALENCE.MIN}
        y1={0}
        x2={VALENCE.MAX}
        y2={0}
        stroke={GRAY_COLORS[400]}
        strokeWidth="0.002"
      />
      
      {/* Y축 (Arousal) */}
      <line
        x1={0}
        y1={AROUSAL.MIN}
        x2={0}
        y2={AROUSAL.MAX}
        stroke={GRAY_COLORS[400]}
        strokeWidth="0.002"
      />
      
      {/* X축 라벨 */}
      <text
        x={VALENCE.MAX - 0.1}
        y={0.05}
        fontSize="0.02"
        fill={GRAY_COLORS[600]}
        textAnchor="end"
      >
        Valence +
      </text>
      <text
        x={VALENCE.MIN + 0.1}
        y={0.05}
        fontSize="0.02"
        fill={GRAY_COLORS[600]}
        textAnchor="start"
      >
        Valence −
      </text>
      
      {/* Y축 라벨 */}
      <text
        x={0.05}
        y={AROUSAL.MAX + 0.05}
        fontSize="0.02"
        fill={GRAY_COLORS[600]}
        textAnchor="start"
      >
        Arousal +
      </text>
      <text
        x={0.05}
        y={AROUSAL.MIN - 0.02}
        fontSize="0.02"
        fill={GRAY_COLORS[600]}
        textAnchor="start"
      >
        Arousal −
      </text>
    </g>
  );
});

Axes.displayName = 'Axes';

// ============================================================================
// Quadrant Labels Component
// ============================================================================

const QuadrantLabels = memo(() => {
  const labelStyle = {
    fontSize: '0.025',
    fill: GRAY_COLORS[500],
    opacity: 0.6,
    fontWeight: 'bold',
  };

  return (
    <g className="quadrant-labels">
      {/* Q1: Joy (V+, A+) */}
      <text x={0.5} y={0.5} textAnchor="middle" {...labelStyle}>
        Joy
      </text>
      
      {/* Q2: Anger (V-, A+) */}
      <text x={-0.5} y={0.5} textAnchor="middle" {...labelStyle}>
        Anger
      </text>
      
      {/* Q3: Sadness (V-, A-) */}
      <text x={-0.5} y={-0.5} textAnchor="middle" {...labelStyle}>
        Sadness
      </text>
      
      {/* Q4: Calm (V+, A-) */}
      <text x={0.5} y={-0.5} textAnchor="middle" {...labelStyle}>
        Calm
      </text>
    </g>
  );
});

QuadrantLabels.displayName = 'QuadrantLabels';

// ============================================================================
// Main VAPlane Component
// ============================================================================

export interface IVAPlaneProps {
  readonly children: React.ReactNode;
  readonly showGrid?: boolean;
  readonly showAxes?: boolean;
  readonly showLabels?: boolean;
  readonly width?: number | string;
  readonly height?: number | string;
}

/**
 * V-A 평면 메인 컴포넌트
 */
export const VAPlane = memo<IVAPlaneProps>(({ 
  children, 
  showGrid = true,
  showAxes = true,
  showLabels = true,
  width = '70%',
  height = '70%',
}) => {
  const { VALENCE, AROUSAL } = VA_COORDINATE_RANGE;
  const padding = 0.1;
  
  const viewBox = `${VALENCE.MIN - padding} ${AROUSAL.MIN - padding} ${(VALENCE.MAX - VALENCE.MIN) + padding * 2} ${(AROUSAL.MAX - AROUSAL.MIN) + padding * 2}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      className="border border-gray-300 rounded-lg bg-white mx-auto"
      style={{ 
        maxWidth: '70%',
        aspectRatio: '1 / 1', // 정사각형으로 만들기
        display: 'block',
      }}
    >
      <GridBackground />
      
      {/* 격자 배경 */}
      {showGrid && (
        <rect 
          x={VALENCE.MIN - padding} 
          y={AROUSAL.MIN - padding} 
          width={(VALENCE.MAX - VALENCE.MIN) + padding * 2} 
          height={(AROUSAL.MAX - AROUSAL.MIN) + padding * 2} 
          fill="url(#grid)" 
        />
      )}
      
      {/* 사분면 배경 (파스텔 톤) */}
      <g className="quadrant-backgrounds" opacity="0.2">
        <rect x="0" y="0" width="1" height="1" fill="url(#quadrant-1)" />
        <rect x="-1" y="0" width="1" height="1" fill="url(#quadrant-2)" />
        <rect x="-1" y="-1" width="1" height="1" fill="url(#quadrant-3)" />
        <rect x="0" y="-1" width="1" height="1" fill="url(#quadrant-4)" />
      </g>
      
      {/* 좌표축 */}
      {showAxes && <Axes />}
      
      {/* 사분면 라벨 */}
      {showLabels && <QuadrantLabels />}
      
      {/* 자식 요소 (점, 프로토타입 등) */}
      <g className="content">
        {children}
      </g>
    </svg>
  );
});

VAPlane.displayName = 'VAPlane';
