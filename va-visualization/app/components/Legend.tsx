/**
 * @file Legend.tsx
 * @description 신뢰도 색상 범례 컴포넌트
 */

import React from 'react';
import { CONFIDENCE_COLORS } from '@/lib/constants/colors.const';

export const Legend = () => (
  <div className="mt-6 flex flex-wrap gap-4 text-sm">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CONFIDENCE_COLORS.HIGH }}></div>
      <span className="text-gray-600">높은 신뢰도 (≥0.8)</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CONFIDENCE_COLORS.MEDIUM }}></div>
      <span className="text-gray-600">중간 신뢰도 (0.7-0.8)</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CONFIDENCE_COLORS.LOW }}></div>
      <span className="text-gray-600">낮은 신뢰도 (&lt;0.7)</span>
    </div>
  </div>
);

Legend.displayName = 'Legend';
