/**
 * @file EmotionDataManager.ts
 * @description 감정 데이터 관리 및 변환 시스템
 * @principle Single Responsibility - 감정 데이터 관리만 담당
 */

import type {
  IRawEmotionData,
  IEmotionData,
  IEmotionFilter,
  IEmotionSortOptions,
  IEmotionStatistics,
  EmotionDataArray,
  EmotionDataMap,
} from '@/lib/types/emotion.types';
import {
  validateRawEmotionData,
  validateEmotionDataArray,
  sanitizeString,
  clampValence,
  clampArousal,
  clampConfidence,
} from '@/lib/utils/validation/data.validator';
import { summary } from '@/lib/utils/math/statistics.util';

/**
 * 감정 데이터 관리자 클래스
 */
export class EmotionDataManager {
  private data: EmotionDataMap;
  private rawData: IRawEmotionData[];

  constructor(rawData: IRawEmotionData[] = []) {
    this.rawData = rawData;
    this.data = new Map();
    
    if (rawData.length > 0) {
      this.loadData(rawData);
    }
  }

  /**
   * 원시 데이터 로드 및 정규화
   */
  public loadData(rawData: IRawEmotionData[]): void {
    // 데이터 검증
    const validation = validateEmotionDataArray(rawData);
    if (!validation.isValid) {
      console.error('Data validation failed:', validation.errors);
      throw new Error(`Invalid emotion data: ${validation.errors.join(', ')}`);
    }

    this.rawData = rawData;
    this.data.clear();

    // 원시 데이터 → 정규화된 데이터 변환
    rawData.forEach((raw) => {
      const normalized = this.normalizeRawData(raw);
      if (normalized) {
        this.data.set(normalized.term, normalized);
      }
    });
  }

  /**
   * 원시 데이터를 정규화된 형식으로 변환
   */
  private normalizeRawData(raw: IRawEmotionData): IEmotionData | null {
    const validation = validateRawEmotionData(raw);
    if (!validation.isValid) {
      console.warn(`Skipping invalid data for term: ${raw.term}`, validation.errors);
      return null;
    }

    return {
      term: sanitizeString(raw.term),
      valence: clampValence(raw.valence),
      arousal: clampArousal(raw.arousal),
      dominance: raw.dominance !== undefined ? raw.dominance : undefined,
      confidence: raw.confidence !== undefined ? clampConfidence(raw.confidence) : 0.7,
      mergeStrategy: this.normalizeMergeStrategy(raw.merge_strategy),
      isMultiword: raw.is_multiword ?? false,
      metadata: {
        sourceWarriner: raw.source_warriner,
        sourceNRC: raw.source_nrc,
        rawData: raw,
      },
    };
  }

  /**
   * Merge Strategy 정규화
   */
  private normalizeMergeStrategy(
    strategy?: string
  ): 'both_weighted' | 'warriner_only' | 'nrc_only' | 'unknown' {
    if (!strategy) return 'unknown';
    
    switch (strategy.toLowerCase()) {
      case 'both_weighted':
        return 'both_weighted';
      case 'warriner_only':
        return 'warriner_only';
      case 'nrc_only':
        return 'nrc_only';
      default:
        return 'unknown';
    }
  }

  /**
   * 모든 감정 데이터 반환
   */
  public getAllData(): EmotionDataArray {
    return Array.from(this.data.values());
  }

  /**
   * 특정 term의 감정 데이터 조회
   */
  public getByTerm(term: string): IEmotionData | undefined {
    return this.data.get(sanitizeString(term));
  }

  /**
   * 여러 term의 감정 데이터 조회
   */
  public getByTerms(terms: string[]): IEmotionData[] {
    return terms
      .map((term) => this.getByTerm(term))
      .filter((data): data is IEmotionData => data !== undefined);
  }

  /**
   * 필터 적용하여 데이터 조회
   */
  public filter(filter: IEmotionFilter): EmotionDataArray {
    let filtered = this.getAllData();

    // 검색어 필터
    if (filter.searchTerm && filter.searchTerm.trim()) {
      const searchLower = filter.searchTerm.toLowerCase();
      filtered = filtered.filter((emotion) =>
        emotion.term.toLowerCase().includes(searchLower)
      );
    }

    // Valence 범위 필터
    if (filter.minValence !== undefined) {
      filtered = filtered.filter((emotion) => emotion.valence >= filter.minValence!);
    }
    if (filter.maxValence !== undefined) {
      filtered = filtered.filter((emotion) => emotion.valence <= filter.maxValence!);
    }

    // Arousal 범위 필터
    if (filter.minArousal !== undefined) {
      filtered = filtered.filter((emotion) => emotion.arousal >= filter.minArousal!);
    }
    if (filter.maxArousal !== undefined) {
      filtered = filtered.filter((emotion) => emotion.arousal <= filter.maxArousal!);
    }

    // Confidence 범위 필터
    if (filter.minConfidence !== undefined) {
      filtered = filtered.filter((emotion) => emotion.confidence >= filter.minConfidence!);
    }
    if (filter.maxConfidence !== undefined) {
      filtered = filtered.filter((emotion) => emotion.confidence <= filter.maxConfidence!);
    }

    // Merge Strategy 필터
    if (filter.mergeStrategies && filter.mergeStrategies.length > 0) {
      filtered = filtered.filter((emotion) =>
        filter.mergeStrategies!.includes(emotion.mergeStrategy)
      );
    }

    // Multiword 필터
    if (filter.includeMultiword === false) {
      filtered = filtered.filter((emotion) => !emotion.isMultiword);
    }

    return filtered;
  }

  /**
   * 정렬 적용
   */
  public sort(data: EmotionDataArray, options: IEmotionSortOptions): EmotionDataArray {
    const { field, direction } = options;
    const sorted = [...data];

    sorted.sort((a, b) => {
      let compareValue = 0;

      switch (field) {
        case 'term':
          compareValue = a.term.localeCompare(b.term);
          break;
        case 'valence':
          compareValue = a.valence - b.valence;
          break;
        case 'arousal':
          compareValue = a.arousal - b.arousal;
          break;
        case 'confidence':
          compareValue = a.confidence - b.confidence;
          break;
      }

      return direction === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }

  /**
   * 통계 계산
   */
  public calculateStatistics(data?: EmotionDataArray): IEmotionStatistics {
    const emotions = data || this.getAllData();

    const valences = emotions.map((e) => e.valence);
    const arousals = emotions.map((e) => e.arousal);

    const valenceSummary = summary(valences);
    const arousalSummary = summary(arousals);

    // 병합 전략별 개수
    const byStrategy: Record<string, number> = {};
    emotions.forEach((emotion) => {
      byStrategy[emotion.mergeStrategy] = (byStrategy[emotion.mergeStrategy] || 0) + 1;
    });

    // 신뢰도별 개수
    const byConfidence = {
      high: emotions.filter((e) => e.confidence >= 0.8).length,
      medium: emotions.filter((e) => e.confidence >= 0.7 && e.confidence < 0.8).length,
      low: emotions.filter((e) => e.confidence < 0.7).length,
    };

    return {
      total: emotions.length,
      byStrategy,
      byConfidence,
      valenceRange: {
        min: valenceSummary.min,
        max: valenceSummary.max,
        mean: valenceSummary.mean,
        median: valenceSummary.median,
      },
      arousalRange: {
        min: arousalSummary.min,
        max: arousalSummary.max,
        mean: arousalSummary.mean,
        median: arousalSummary.median,
      },
    };
  }

  /**
   * 데이터 개수 반환
   */
  public getCount(): number {
    return this.data.size;
  }

  /**
   * 데이터가 비어있는지 확인
   */
  public isEmpty(): boolean {
    return this.data.size === 0;
  }

  /**
   * 데이터 초기화
   */
  public clear(): void {
    this.data.clear();
    this.rawData = [];
  }

  /**
   * 단일 감정 데이터 추가
   */
  public add(emotion: IEmotionData): void {
    this.data.set(emotion.term, emotion);
  }

  /**
   * 여러 감정 데이터 추가
   */
  public addMany(emotions: IEmotionData[]): void {
    emotions.forEach((emotion) => this.add(emotion));
  }

  /**
   * 단일 감정 데이터 제거
   */
  public remove(term: string): boolean {
    return this.data.delete(sanitizeString(term));
  }

  /**
   * 여러 감정 데이터 제거
   */
  public removeMany(terms: string[]): number {
    let removed = 0;
    terms.forEach((term) => {
      if (this.remove(term)) removed++;
    });
    return removed;
  }

  /**
   * 감정 데이터 업데이트
   */
  public update(term: string, updates: Partial<IEmotionData>): boolean {
    const existing = this.getByTerm(term);
    if (!existing) return false;

    const updated = { ...existing, ...updates };
    this.data.set(existing.term, updated);
    return true;
  }

  /**
   * 데이터 내보내기 (JSON)
   */
  public export(): string {
    return JSON.stringify(this.getAllData(), null, 2);
  }

  /**
   * 데이터 가져오기 (JSON)
   */
  public import(jsonString: string): void {
    try {
      const data = JSON.parse(jsonString) as IEmotionData[];
      this.addMany(data);
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * 데이터 복제
   */
  public clone(): EmotionDataManager {
    return new EmotionDataManager(this.rawData);
  }

  /**
   * 두 데이터 관리자 병합
   */
  public merge(other: EmotionDataManager): void {
    const otherData = other.getAllData();
    this.addMany(otherData);
  }
}

/**
 * 감정 데이터 관리자 팩토리
 */
export class EmotionDataManagerFactory {
  private static instance: EmotionDataManager | null = null;

  /**
   * 싱글톤 인스턴스 생성 또는 반환
   */
  static getInstance(rawData?: IRawEmotionData[]): EmotionDataManager {
    if (!this.instance) {
      this.instance = new EmotionDataManager(rawData);
    } else if (rawData) {
      this.instance.loadData(rawData);
    }
    return this.instance;
  }

  /**
   * 새 인스턴스 생성
   */
  static create(rawData?: IRawEmotionData[]): EmotionDataManager {
    return new EmotionDataManager(rawData);
  }

  /**
   * 싱글톤 인스턴스 초기화
   */
  static reset(): void {
    this.instance = null;
  }
}

