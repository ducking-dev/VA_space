/**
 * @file Controls.tsx
 * @description 시각화 컨트롤 패널(검색, 토글 등)
 */

import React from 'react';

interface IControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showPrototypes: boolean;
  onTogglePrototypes: () => void;
  totalPoints: number;
  visiblePoints: number;
}

export const Controls = React.memo<IControlsProps>(({
  searchTerm,
  onSearchChange,
  showPrototypes,
  onTogglePrototypes,
  totalPoints,
  visiblePoints,
}) => (
  <div className="flex flex-wrap items-center gap-4 mb-6">
    {/* 검색 바 */}
    <div className="flex-1 min-w-[200px]">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="감정 단어 검색..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>

    {/* 프로토타입 토글 */}
    <button
      onClick={onTogglePrototypes}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        showPrototypes 
          ? 'bg-green-500 text-white hover:bg-green-600' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {showPrototypes ? '✓' : '○'} 감정 프로토타입
    </button>

    {/* 통계 */}
    <div className="text-sm text-gray-600 font-medium">
      {visiblePoints.toLocaleString()} / {totalPoints.toLocaleString()} 감정 단어
    </div>
  </div>
));

Controls.displayName = 'Controls';
