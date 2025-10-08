/**
 * @file EmotionTooltip.tsx
 * @description 감정 데이터 툴팁 컴포넌트
 * @principle Presentation Component - 정보 표시만 담당
 */

'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IRenderablePoint } from '@/lib/types/emotion.types';
import { getStrategyColor } from '@/lib/constants/colors.const';
import { TOOLTIP_CONFIG } from '@/lib/constants/visualization.const';
import { formatDecimal, formatPercent } from '@/lib/utils/format/number.util';

// ============================================================================
// Tooltip Content Components
// ============================================================================

interface ITooltipHeaderProps {
  term: string;
  isMultiword: boolean;
}

const TooltipHeader = memo<ITooltipHeaderProps>(({ term, isMultiword }) => (
  <div className="mb-3">
    <h3 className="font-bold text-lg text-gray-900 break-words">
      {term}
    </h3>
    {isMultiword && (
      <span className="text-xs text-gray-500 italic">(다중어 표현)</span>
    )}
  </div>
));

TooltipHeader.displayName = 'TooltipHeader';

// ============================================================================

interface ITooltipCoordinatesProps {
  valence: number;
  arousal: number;
}

const TooltipCoordinates = memo<ITooltipCoordinatesProps>(({ valence, arousal }) => (
  <div className="grid grid-cols-2 gap-4 mb-3">
    <div>
      <div className="text-sm text-gray-600">Valence</div>
      <div className="font-semibold text-blue-600">
        {formatDecimal(valence, 3)}
      </div>
    </div>
    <div>
      <div className="text-sm text-gray-600">Arousal</div>
      <div className="font-semibold text-red-600">
        {formatDecimal(arousal, 3)}
      </div>
    </div>
  </div>
));

TooltipCoordinates.displayName = 'TooltipCoordinates';

// ============================================================================

interface ITooltipStrategyProps {
  strategy: string;
}

const TooltipStrategy = memo<ITooltipStrategyProps>(({ strategy }) => {
  const strategyColors = getStrategyColor(strategy);
  
  return (
    <div className="mb-3">
      <div className="text-sm text-gray-600 mb-1">병합 전략</div>
      <span 
        className={`px-2 py-1 rounded-full text-xs font-medium`}
        style={{
          backgroundColor: strategyColors.bg,
          color: strategyColors.text,
        }}
      >
        {strategy}
      </span>
    </div>
  );
});

TooltipStrategy.displayName = 'TooltipStrategy';

// ============================================================================

interface ITooltipConfidenceProps {
  confidence: number;
}

const TooltipConfidence = memo<ITooltipConfidenceProps>(({ confidence }) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-600';
    if (conf >= 0.7) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-500';
    if (conf >= 0.7) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="text-sm text-gray-600 mb-1">신뢰도</div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(confidence)}`}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
          {formatPercent(confidence, 1)}
        </span>
      </div>
    </div>
  );
});

TooltipConfidence.displayName = 'TooltipConfidence';

// ============================================================================
// Main Tooltip Component
// ============================================================================

export interface IEmotionTooltipProps {
  point: IRenderablePoint | null;
  position: { x: number; y: number };
}

/**
 * 감정 데이터 툴팁 컴포넌트
 */
export const EmotionTooltip = memo<IEmotionTooltipProps>(({ point, position }) => {
  if (!point) return null;

  // 화면 경계 체크 및 위치 조정
  const tooltipStyle = {
    left: Math.min(position.x + TOOLTIP_CONFIG.OFFSET_X, window.innerWidth - TOOLTIP_CONFIG.MAX_WIDTH - 20),
    top: Math.max(position.y + TOOLTIP_CONFIG.OFFSET_Y, 20),
    maxWidth: TOOLTIP_CONFIG.MAX_WIDTH,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="absolute z-50 bg-white rounded-lg shadow-2xl border border-gray-300 p-4 pointer-events-none backdrop-blur-sm"
        style={tooltipStyle}
      >
        {/* 툴팁 화살표 */}
        <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-300 transform rotate-45 shadow-sm" />

        {/* 툴팁 내용 */}
        <div className="relative">
          <TooltipHeader 
            term={point.term} 
            isMultiword={point.isMultiword} 
          />

          <TooltipCoordinates 
            valence={point.valence} 
            arousal={point.arousal} 
          />

          <TooltipStrategy strategy={point.mergeStrategy} />

          <TooltipConfidence confidence={point.confidence} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

EmotionTooltip.displayName = 'EmotionTooltip';

// ============================================================================
// Simplified Tooltip (성능 최적화 버전)
// ============================================================================

export interface ISimpleTooltipProps {
  point: IRenderablePoint | null;
  position: { x: number; y: number };
}

/**
 * 간단한 툴팁 (대량 데이터용)
 */
export const SimpleTooltip = memo<ISimpleTooltipProps>(({ point, position }) => {
  if (!point) return null;

  return (
    <div
      className="absolute z-50 bg-gray-900 text-white text-sm rounded px-2 py-1 pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)',
      }}
    >
      {point.term}
    </div>
  );
});

SimpleTooltip.displayName = 'SimpleTooltip';
