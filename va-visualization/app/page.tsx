/**
 * @file page.tsx
 * @description 메인 V-A 시각화 페이지
 * @principle Container Component - 데이터 로직과 UI 조합
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { VAPlane } from './components/VAPlane';
import { ScatterPlot, VirtualizedScatterPlot } from './components/ScatterPlot';
import { EmotionTooltip } from './components/EmotionTooltip';
import { EmotionPrototypes } from './components/EmotionPrototypes';
import { Controls } from './components/Controls';
import { Legend } from './components/Legend';
import { useEmotionData, useHover, useViewport, useVisualizationState } from '@/lib/hooks';
import { ServiceWorkerManager } from '@/lib/utils/serviceWorker';
import type { IRenderablePoint } from '@/lib/types/emotion.types';

// ============================================================================
// Loading Component
// ============================================================================

const LoadingIndicator = ({ progress }: { progress: number }) => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="w-full max-w-md text-center">
      <p className="text-gray-600 font-medium mb-4">감정 데이터 로딩 중...</p>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div 
          className="bg-blue-500 h-4 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-blue-600 font-semibold mt-2">{progress.toFixed(0)}%</p>
    </div>
  </div>
);

// ============================================================================
// Error Component
// ============================================================================

interface IErrorDisplayProps {
  error: Error;
  onRetry: () => void;
}

const ErrorDisplay = ({ error, onRetry }: IErrorDisplayProps) => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">오류 발생</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        다시 시도
      </button>
    </div>
  </div>
);

// ============================================================================
// Main Page Component
// ============================================================================

export default function Home() {
  // ========== Custom Hooks ==========
  const { data: emotions, rawData, isLoading, error, progress, refetch } = useEmotionData(true);
  
  const { hoveredItem: hoveredPoint, setHoveredItem } = useHover<IRenderablePoint>();
  const { viewport } = useViewport();
  const {
    searchTerm,
    showPrototypes,
    handleSearchChange,
    handleTogglePrototypes,
  } = useVisualizationState();

  // ========== Service Worker 등록 ==========
  useEffect(() => {
    // 임시로 Service Worker 비활성화 (디버깅용)
    console.log('[App] Service Worker disabled for debugging');
    
    // const swManager = ServiceWorkerManager.getInstance();
    // swManager.register().then((registration) => {
    //   if (registration) {
    //     console.log('[App] Service Worker registered successfully');
        
    //     // 개발 환경에서 캐시 클리어 (문제 해결을 위해)
    //     if (process.env.NODE_ENV === 'development') {
    //       console.log('[App] Clearing caches for development...');
    //       swManager.clearCache();
    //     }
    //   }
    // });
  }, []);

  // ========== Search ==========
  const filteredEmotions = useMemo(() => {
    if (!emotions) return [];
    if (!searchTerm.trim()) return emotions;

    const lowerSearch = searchTerm.toLowerCase();
    return emotions.filter(emotion => 
      emotion.term.toLowerCase().includes(lowerSearch)
    );
  }, [emotions, searchTerm]);

  // ========== Mouse Position for Tooltip ==========
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  // 툴팁 위치 계산 (V-A 평면 내에서 더 정확한 위치)
  const getTooltipPosition = useCallback((point: IRenderablePoint | null) => {
    if (!point) return mousePosition;
    
    // V-A 좌표를 화면 좌표로 변환 (대략적인 계산)
    const containerElement = document.querySelector('.va-plane-container');
    const containerRect = containerElement?.getBoundingClientRect();
    if (!containerRect) return mousePosition;
    
    // V-A 좌표 (-1 ~ 1)를 컨테이너 내 상대 좌표로 변환
    const relativeX = ((point.valence + 1) / 2) * containerRect.width;
    const relativeY = ((1 - point.arousal) / 2) * containerRect.height;
    
    return {
      x: containerRect.left + relativeX,
      y: containerRect.top + relativeY
    };
  }, [mousePosition]);

  // ========== Rendering ==========

  // 로딩 상태
  if (isLoading) {
    return <LoadingIndicator progress={progress} />;
  }

  // 에러 상태
  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  // 데이터 없음
  if (!emotions || emotions.length === 0) {
    // 로딩이 끝났지만 데이터가 없는 경우
    if (!isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600">데이터가 없습니다.</p>
        </div>
      );
    }
    // 아직 로딩중이면 로딩 인디케이터를 계속 보여줌
    return <LoadingIndicator progress={progress} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 왼쪽: V-A 평면 */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full">
              {/* 컨트롤 패널 */}
              <Controls
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                showPrototypes={showPrototypes}
                onTogglePrototypes={handleTogglePrototypes}
                totalPoints={rawData?.length || 0}
                visiblePoints={filteredEmotions.length}
              />

              {/* V-A 평면 */}
              <div className="relative va-plane-container mt-6" onMouseMove={handleMouseMove}>
                <VAPlane showGrid showAxes showLabels>
                  {/* 산점도 */}
                  {filteredEmotions.length > 10000 ? (
                    <VirtualizedScatterPlot
                      points={filteredEmotions}
                      viewport={{
                        minX: -1.1,
                        maxX: 1.1,
                        minY: -1.1,
                        maxY: 1.1,
                      }}
                      onHover={setHoveredItem}
                      hoveredPoint={hoveredPoint}
                      isPartial={isLoading}
                    />
                  ) : (
                    <ScatterPlot
                      points={filteredEmotions}
                      onHover={setHoveredItem}
                      hoveredPoint={hoveredPoint}
                      isPartial={isLoading}
                    />
                  )}

                  {/* 감정 프로토타입 */}
                  <EmotionPrototypes visible={showPrototypes} />
                </VAPlane>

                {/* 툴팁 */}
                <EmotionTooltip 
                  point={hoveredPoint}
                  position={getTooltipPosition(hoveredPoint)}
                />
              </div>
            </div>
          </div>

          {/* 오른쪽: 범례 */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <Legend />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
