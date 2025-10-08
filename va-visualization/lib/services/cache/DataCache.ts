/**
 * @file DataCache.ts
 * @description 데이터 캐싱 시스템
 * @principle Single Responsibility - 데이터 캐싱만 담당
 */

import { CACHE_TTL, buildCacheKey } from '@/lib/constants/api.const';

/**
 * 캐시 항목 인터페이스
 */
interface ICacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * 캐시 통계
 */
interface ICacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * 데이터 캐시 클래스
 */
export class DataCache {
  private cache: Map<string, ICacheEntry<any>>;
  private hits: number;
  private misses: number;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
    this.maxSize = maxSize;
  }

  /**
   * 캐시에 데이터 저장
   */
  set<T>(key: string, data: T, ttl: number = CACHE_TTL.MEDIUM): void {
    // 최대 크기 초과 시 가장 오래된 항목 제거 (LRU)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // 초 → 밀리초
    });
  }

  /**
   * 캐시에서 데이터 조회
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // TTL 만료 확인
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data as T;
  }

  /**
   * 캐시에 데이터가 있는지 확인
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // TTL 만료 확인
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 캐시에서 특정 키 제거
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 패턴 매칭으로 캐시 제거
   */
  deleteByPattern(pattern: string | RegExp): number {
    let deleted = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * 모든 캐시 초기화
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 만료된 캐시 항목 정리
   */
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * 캐시 크기 반환
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 캐시 통계 반환
   */
  getStats(): ICacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /**
   * 캐시 통계 초기화
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 모든 캐시 키 반환
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 캐시된 데이터와 함께 조회 (없으면 생성)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * 캐시된 데이터와 함께 조회 (동기)
   */
  getOrSetSync<T>(key: string, factory: () => T, ttl: number = CACHE_TTL.MEDIUM): T {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = factory();
    this.set(key, data, ttl);
    return data;
  }
}

/**
 * 글로벌 캐시 인스턴스들
 */
class CacheManager {
  private caches: Map<string, DataCache>;

  constructor() {
    this.caches = new Map();
  }

  /**
   * 특정 이름의 캐시 반환 (없으면 생성)
   */
  getCache(name: string, maxSize: number = 100): DataCache {
    if (!this.caches.has(name)) {
      this.caches.set(name, new DataCache(maxSize));
    }
    return this.caches.get(name)!;
  }

  /**
   * 모든 캐시 초기화
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  /**
   * 모든 캐시 정리 (만료된 항목)
   */
  cleanupAll(): number {
    let total = 0;
    for (const cache of this.caches.values()) {
      total += cache.cleanup();
    }
    return total;
  }

  /**
   * 모든 캐시 통계 반환
   */
  getAllStats(): Record<string, ICacheStats> {
    const stats: Record<string, ICacheStats> = {};
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats();
    }
    return stats;
  }
}

/**
 * 싱글톤 캐시 매니저
 */
const cacheManager = new CacheManager();

/**
 * 캐시 매니저 반환
 */
export function getCacheManager(): CacheManager {
  return cacheManager;
}

/**
 * 특정 캐시 인스턴스 반환
 */
export function getCache(name: string, maxSize?: number): DataCache {
  return cacheManager.getCache(name, maxSize);
}

/**
 * 전역 캐시 인스턴스들
 */
export const emotionDataCache = getCache('emotionData', 200);
export const searchResultsCache = getCache('searchResults', 100);
export const statisticsCache = getCache('statistics', 10);

/**
 * 주기적 캐시 정리 (선택적)
 */
export function startCacheCleanup(intervalMs: number = 60000): NodeJS.Timeout {
  return setInterval(() => {
    const cleaned = cacheManager.cleanupAll();
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired cache entries`);
    }
  }, intervalMs);
}

/**
 * 캐시 정리 중지
 */
export function stopCacheCleanup(timerId: NodeJS.Timeout): void {
  clearInterval(timerId);
}

/**
 * 메모이제이션 데코레이터 (함수 캐싱)
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl: number = CACHE_TTL.MEDIUM
): T {
  const cache = new DataCache();
  const defaultKeyGen = (...args: Parameters<T>) => JSON.stringify(args);
  const getKey = keyGenerator || defaultKeyGen;

  return ((...args: Parameters<T>) => {
    const key = getKey(...args);
    return cache.getOrSetSync(key, () => fn(...args), ttl);
  }) as T;
}

/**
 * 비동기 메모이제이션 데코레이터
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl: number = CACHE_TTL.MEDIUM
): T {
  const cache = new DataCache();
  const defaultKeyGen = (...args: Parameters<T>) => JSON.stringify(args);
  const getKey = keyGenerator || defaultKeyGen;

  return (async (...args: Parameters<T>) => {
    const key = getKey(...args);
    return cache.getOrSet(key, () => fn(...args), ttl);
  }) as T;
}

/**
 * 캐시 키 빌더 유틸리티
 */
export const CacheKeys = {
  emotionData: (id?: string) => buildCacheKey('emotions', id || 'all'),
  searchResults: (query: string) => buildCacheKey('search', query),
  statistics: () => buildCacheKey('stats', 'global'),
};

