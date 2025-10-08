/**
 * Web Worker 관리 유틸리티
 */

import type { IEmotionData, IRenderablePoint } from '@/lib/types/emotion.types';

interface WorkerMessage {
  type: string;
  id: string;
  data?: any;
  result?: any;
  error?: any;
}

interface FilterOptions {
  searchTerm?: string;
  minConfidence?: number;
  valenceRange?: { min: number; max: number };
  arousalRange?: { min: number; max: number };
}

export class WebWorkerManager {
  private static instance: WebWorkerManager;
  private worker: Worker | null = null;
  private messageId = 0;
  private pendingMessages = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>();

  private constructor() {}

  public static getInstance(): WebWorkerManager {
    if (!WebWorkerManager.instance) {
      WebWorkerManager.instance = new WebWorkerManager();
    }
    return WebWorkerManager.instance;
  }

  /**
   * Web Worker 초기화
   */
  public async initialize(): Promise<void> {
    if (this.worker) {
      console.log('[WebWorker] Worker already initialized');
      return;
    }

    if (!window.Worker) {
      console.warn('[WebWorker] Web Workers not supported');
      return;
    }

    try {
      console.log('[WebWorker] Creating new Worker instance...');
      this.worker = new Worker('/dataWorker.js');
      
      this.worker.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.worker.onerror = (error) => {
        console.error('[WebWorker] Worker error:', error);
      };

      // 초기화 완료 대기
      await this.waitForInitialization();
      console.log('[WebWorker] Web Worker initialized successfully');
    } catch (error) {
      console.error('[WebWorker] Failed to initialize worker:', error);
    }
  }

  /**
   * Worker 초기화 완료 대기
   */
  private waitForInitialization(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn('[WebWorker] Initialization timeout, continuing anyway...');
        resolve(); // 타임아웃 시에도 계속 진행
      }, 3000); // 타임아웃을 3초로 단축

      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'INITIALIZED') {
          clearTimeout(timeout);
          this.worker!.removeEventListener('message', handleMessage);
          resolve();
        }
      };

      this.worker!.addEventListener('message', handleMessage);
    });
  }

  /**
   * 메시지 처리
   */
  private handleMessage(data: WorkerMessage): void {
    const { type, id, result, error } = data;

    if (type === 'INITIALIZED') {
      return;
    }

    const pending = this.pendingMessages.get(id);
    if (!pending) {
      console.warn('[WebWorker] Received message for unknown ID:', id);
      return;
    }

    this.pendingMessages.delete(id);

    if (type === 'SUCCESS') {
      pending.resolve(result);
    } else if (type === 'ERROR') {
      pending.reject(new Error(error.message));
    }
  }

  /**
   * Worker에 메시지 전송
   */
  private sendMessage(type: string, data: any): Promise<any> {
    if (!this.worker) {
      return Promise.reject(new Error('Worker not initialized'));
    }

    const id = `msg_${++this.messageId}`;
    
    return new Promise((resolve, reject) => {
      this.pendingMessages.set(id, { resolve, reject });
      
      this.worker!.postMessage({
        type,
        id,
        data
      });

      // 타임아웃 설정 (5초로 단축)
      setTimeout(() => {
        if (this.pendingMessages.has(id)) {
          this.pendingMessages.delete(id);
          reject(new Error('Worker message timeout'));
        }
      }, 5000);
    });
  }

  /**
   * 데이터 변환
   */
  public async transformData(
    emotions: IEmotionData[],
    canvasWidth: number = 800,
    canvasHeight: number = 600
  ): Promise<IRenderablePoint[]> {
    await this.initialize();
    return this.sendMessage('TRANSFORM_DATA', {
      emotions,
      canvasWidth,
      canvasHeight
    });
  }

  /**
   * 데이터 필터링
   */
  public async filterData(
    emotions: IEmotionData[],
    filters: FilterOptions
  ): Promise<IEmotionData[]> {
    await this.initialize();
    return this.sendMessage('FILTER_DATA', {
      emotions,
      filters
    });
  }

  /**
   * 데이터 검색
   */
  public async searchData(
    emotions: IEmotionData[],
    searchTerm: string
  ): Promise<IEmotionData[]> {
    await this.initialize();
    return this.sendMessage('SEARCH_DATA', {
      emotions,
      searchTerm
    });
  }

  /**
   * 통계 계산
   */
  public async calculateStatistics(emotions: IEmotionData[]): Promise<any> {
    await this.initialize();
    return this.sendMessage('CALCULATE_STATISTICS', {
      emotions
    });
  }

  /**
   * Worker 종료
   */
  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.pendingMessages.clear();
      console.log('[WebWorker] Worker terminated');
    }
  }

  /**
   * Worker 상태 확인
   */
  public getStatus(): {
    isSupported: boolean;
    isInitialized: boolean;
    pendingMessages: number;
  } {
    return {
      isSupported: !!window.Worker,
      isInitialized: !!this.worker,
      pendingMessages: this.pendingMessages.size
    };
  }
}

/**
 * Web Worker 훅
 */
export function useWebWorker() {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    const workerManager = WebWorkerManager.getInstance();
    
    setIsSupported(workerManager.getStatus().isSupported);
    
    if (workerManager.getStatus().isSupported) {
      workerManager.initialize().then(() => {
        setIsInitialized(true);
      }).catch((error) => {
        console.error('[WebWorker] Initialization failed:', error);
      });
    }

    return () => {
      workerManager.terminate();
    };
  }, []);

  return {
    isSupported,
    isInitialized,
    transformData: (emotions: IEmotionData[], canvasWidth?: number, canvasHeight?: number) => 
      WebWorkerManager.getInstance().transformData(emotions, canvasWidth, canvasHeight),
    filterData: (emotions: IEmotionData[], filters: FilterOptions) => 
      WebWorkerManager.getInstance().filterData(emotions, filters),
    searchData: (emotions: IEmotionData[], searchTerm: string) => 
      WebWorkerManager.getInstance().searchData(emotions, searchTerm),
    calculateStatistics: (emotions: IEmotionData[]) => 
      WebWorkerManager.getInstance().calculateStatistics(emotions)
  };
}

// React import
import React from 'react';


