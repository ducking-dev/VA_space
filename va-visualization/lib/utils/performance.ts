/**
 * @file performance.ts
 * @description 성능 모니터링 및 측정 유틸리티
 */

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 성능 측정 시작
   */
  startTiming(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label)!.push(duration);
      
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    };
  }

  /**
   * 메트릭 조회
   */
  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, any> = {};
    
    for (const [label, times] of this.metrics) {
      if (times.length > 0) {
        result[label] = {
          avg: times.reduce((a, b) => a + b, 0) / times.length,
          min: Math.min(...times),
          max: Math.max(...times),
          count: times.length,
        };
      }
    }
    
    return result;
  }

  /**
   * 메트릭 초기화
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * 메모리 사용량 측정
   */
  getMemoryUsage(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  /**
   * 네트워크 정보 조회
   */
  getNetworkInfo(): any {
    if ('connection' in navigator) {
      return (navigator as any).connection;
    }
    return null;
  }
}

/**
 * 성능 측정 데코레이터
 */
export function measurePerformance(label: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();
      const endTiming = monitor.startTiming(`${target.constructor.name}.${propertyName}`);
      
      try {
        const result = await method.apply(this, args);
        return result;
      } finally {
        endTiming();
      }
    };
  };
}

/**
 * React Hook for Performance Monitoring
 */
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    startTiming: monitor.startTiming.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    clearMetrics: monitor.clearMetrics.bind(monitor),
    getMemoryUsage: monitor.getMemoryUsage.bind(monitor),
    getNetworkInfo: monitor.getNetworkInfo.bind(monitor),
  };
}