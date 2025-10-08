/**
 * @file useEmotionData.ts
 * @description 감정 데이터 로딩 및 관리 Hook
 * @principle Single Responsibility - 감정 데이터 상태 관리만 담당
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChunkedDataLoader } from '@/lib/data/loaders/ChunkedDataLoader';
import { EmotionDataTransformerFactory } from '@/lib/core/visualization/EmotionDataTransformer';
import { PerformanceMonitor } from '@/lib/utils/performance';
import { WebWorkerManager } from '@/lib/utils/webWorker';
import type { IEmotionData, IRenderablePoint, DataLoadingState } from '@/lib/types/emotion.types';

/**
 * useEmotionData 반환 타입
 */
export interface IUseEmotionDataReturn {
  data: IRenderablePoint[] | null;
  rawData: IEmotionData[] | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  progress: number;
  refetch: () => Promise<void>;
}

/**
 * 감정 데이터 로딩 Hook (점진적 로딩 지원)
 */
export function useEmotionData(autoLoad: boolean = true): IUseEmotionDataReturn {
  const [rawData, setRawData] = useState<IEmotionData[]>([]);
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<DataLoadingState>('idle');
  const [error, setError] = useState<Error | null>(null);
  
  const loaderRef = useRef(new ChunkedDataLoader());
  const transformerRef = useRef(EmotionDataTransformerFactory.createDefault());

  const loadData = useCallback(async () => {
    console.log('[useEmotionData] Starting data load...');
    const monitor = PerformanceMonitor.getInstance();
    const endTiming = monitor.startTiming('useEmotionData.loadData');

    setState('loading');
    setError(null);
    setRawData([]);
    setProgress(0);

    try {
      await loaderRef.current.loadDataProgressively((progress, chunk) => {
        console.log(`[useEmotionData] onProgress callback called with progress: ${progress}, chunk size: ${chunk.length}`);
        
        console.log(`[useEmotionData] Progress: ${progress.toFixed(1)}%, Chunk size: ${chunk.length}`);
        setRawData(prev => {
          const newData = [...prev, ...chunk];
          console.log(`[useEmotionData] Total data points: ${newData.length}`);
          return newData;
        });
        setProgress(progress);
        console.log(`[useEmotionData] Progress update completed`);
      });
      console.log('[useEmotionData] Data loading completed successfully');
      setState('success');
      setProgress(100);
    } catch (err) {
      console.error('[useEmotionData] Error during data loading:', err);
      setError(err as Error);
      setState('error');
    } finally {
      endTiming();
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad, loadData]);

  const refetch = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const [renderableData, setRenderableData] = useState<IRenderablePoint[] | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);

  // Web Worker를 사용한 데이터 변환
  useEffect(() => {
    if (!rawData || rawData.length === 0) {
      console.log('[useEmotionData] No raw data available for transformation');
      setRenderableData(null);
      return;
    }

    console.log(`[useEmotionData] Starting transformation of ${rawData.length} emotions`);
    setIsTransforming(true);

    const transformData = async () => {
      const monitor = PerformanceMonitor.getInstance();
      const endTiming = monitor.startTiming('useEmotionData.transformData');
      
      try {
        // Web Worker 사용 시도
        const workerManager = WebWorkerManager.getInstance();
        const result = await workerManager.transformData(rawData, 800, 600);
        console.log(`[useEmotionData] Web Worker transformation completed - result length: ${result?.length || 0}`);
        setRenderableData(result);
      } catch (error) {
        console.warn('[useEmotionData] Web Worker transformation failed, falling back to main thread:', error);
        
        // Web Worker 실패 시 메인 스레드에서 변환
        try {
          const result = transformerRef.current.transformToRenderable(rawData, 800, 600);
          console.log(`[useEmotionData] Main thread transformation completed - result length: ${result?.length || 0}`);
          setRenderableData(result);
        } catch (fallbackError) {
          console.error('[useEmotionData] Error during fallback transformation:', fallbackError);
          setRenderableData(null);
        }
      } finally {
        endTiming();
        setIsTransforming(false);
      }
    };

    transformData();
  }, [rawData]);

  return {
    data: renderableData,
    rawData,
    isLoading: state === 'loading' || isTransforming,
    isSuccess: state === 'success' && !isTransforming,
    isError: state === 'error',
    error,
    progress,
    refetch,
  };
}

/**
 * 감정 검색 Hook
 */
export interface IUseEmotionSearchReturn {
  results: IEmotionData[];
  isSearching: boolean;
  error: Error | null;
  search: (query: string) => Promise<void>;
  clear: () => void;
}

export function useEmotionSearch(debounceMs: number = 300): IUseEmotionSearchReturn {
  const [results, setResults] = useState<IEmotionData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loaderRef = useRef(new ChunkedDataLoader());
  const timeoutRef = useRef<NodeJS.Timeout>();

  const search = useCallback(
    async (query: string) => {
      // 디바운스
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!query.trim()) {
        setResults([]);
        setError(null);
        return;
      }

      timeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        setError(null);

        try {
          // TODO: 검색 기능은 별도 API 엔드포인트로 구현 예정
          // 현재는 전체 데이터를 로드한 후 클라이언트에서 필터링
          const allData = await loaderRef.current.loadData();
          const filtered = allData.filter(emotion => 
            emotion.term.toLowerCase().includes(query.toLowerCase())
          );
          setResults(filtered);
        } catch (err) {
          setError(err as Error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, debounceMs);
    },
    [debounceMs]
  );

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    results,
    isSearching,
    error,
    search,
    clear,
  };
}

/**
 * 감정 통계 Hook
 */
export interface IUseEmotionStatisticsReturn {
  statistics: any | null; // IEmotionStatistics
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useEmotionStatistics(autoLoad: boolean = false): IUseEmotionStatisticsReturn {
  const [statistics, setStatistics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loaderRef = useRef(new ChunkedDataLoader());

  const loadStatistics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: 통계 기능은 별도 API 엔드포인트로 구현 예정
      // 현재는 기본 통계만 제공
      const allData = await loaderRef.current.loadData();
      const stats = {
        totalCount: allData.length,
        valenceRange: {
          min: Math.min(...allData.map(d => d.valence)),
          max: Math.max(...allData.map(d => d.valence))
        },
        arousalRange: {
          min: Math.min(...allData.map(d => d.arousal)),
          max: Math.max(...allData.map(d => d.arousal))
        }
      };
      setStatistics(stats);
    } catch (err) {
      setError(err as Error);
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadStatistics();
    }
  }, [autoLoad, loadStatistics]);

  return {
    statistics,
    isLoading,
    error,
    refetch: loadStatistics,
  };
}

