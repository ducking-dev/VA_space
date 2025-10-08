/**
 * @file color.ts
 * @description 색상 유틸리티 함수 (순수 함수, 불변성)
 * 성능 최적화: 조건문 최소화, 룩업 테이블 활용
 */

import { PASTEL_COLORS, CONFIDENCE_COLOR_MAP, QUADRANT_COLOR_MAP } from '../constants/colors.const';
import type { QuadrantMapKey } from '../constants/colors.const';
import type { IColorMapper } from '../types/emotion';

// ============================================================================
// Color Mapper Implementation (Singleton Pattern)
// ============================================================================

/**
 * 색상 매핑 클래스
 * SRP: 색상 계산만 담당
 * 성능: 룩업 테이블과 캐싱으로 O(1) 성능
 */
class ColorMapper implements IColorMapper {
  private static instance: ColorMapper;
  private readonly colorCache: Map<string, string>;

  private constructor() {
    this.colorCache = new Map();
  }

  /**
   * Singleton 인스턴스 반환
   */
  public static getInstance(): ColorMapper {
    if (!ColorMapper.instance) {
      ColorMapper.instance = new ColorMapper();
    }
    return ColorMapper.instance;
  }

  /**
   * 신뢰도에 따른 점 색상 반환
   * 성능: 캐싱 + 이진 탐색 대신 선형 조회 (항목이 3개뿐이므로 더 빠름)
   */
  public getPointColor(confidence: number): string {
    // 캐시 확인 (성능 최적화)
    const cacheKey = confidence.toFixed(2);
    const cached = this.colorCache.get(cacheKey);
    if (cached) return cached;

    // 룩업 테이블 조회 (O(1) ~ O(3))
    let color: string = PASTEL_COLORS.LOW_CONFIDENCE;
    for (const { min, color: c } of CONFIDENCE_COLOR_MAP) {
      if (confidence >= min) {
        color = c;
        break;
      }
    }

    // 캐시 저장
    this.colorCache.set(cacheKey, color);
    return color;
  }

  /**
   * 사분면에 따른 배경 색상 반환
   * 성능: 비트 연산으로 사분면 계산
   */
  public getQuadrantColor(valence: number, arousal: number): string {
    const quadrant = this.getQuadrantKey(valence, arousal);
    return QUADRANT_COLOR_MAP[quadrant].dark;
  }

  /**
   * 사분면 키 계산
   * 성능: 비트 연산 활용
   */
  private getQuadrantKey(valence: number, arousal: number): QuadrantMapKey {
    // 비트 연산으로 사분면 계산 (매우 빠름)
    const vBit = valence >= 0 ? 1 : 0;
    const aBit = arousal >= 0 ? 1 : 0;
    const quadrantIndex = (aBit << 1) | vBit;
    
    // 룩업 테이블
    const keys: QuadrantMapKey[] = ['q3', 'q4', 'q2', 'q1'];
    return keys[quadrantIndex];
  }

  /**
   * 캐시 초기화
   */
  public clearCache(): void {
    this.colorCache.clear();
  }
}

// ============================================================================
// Exported Functions (Facade Pattern)
// ============================================================================

const colorMapper = ColorMapper.getInstance();

/**
 * 신뢰도에 따른 색상 반환
 */
export const getPointColor = (confidence: number): string => {
  return colorMapper.getPointColor(confidence);
};

/**
 * 사분면에 따른 색상 반환
 */
export const getQuadrantColor = (valence: number, arousal: number): string => {
  return colorMapper.getQuadrantColor(valence, arousal);
};

/**
 * 색상 캐시 초기화
 */
export const clearColorCache = (): void => {
  colorMapper.clearCache();
};

// ============================================================================
// Pure Utility Functions
// ============================================================================

/**
 * RGB를 Hex로 변환
 * 순수 함수
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * Hex를 RGB로 변환
 * 순수 함수
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * 색상 밝기 조정
 * 순수 함수
 */
export const adjustBrightness = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 + percent / 100;
  const r = Math.min(255, Math.max(0, Math.round(rgb.r * factor)));
  const g = Math.min(255, Math.max(0, Math.round(rgb.g * factor)));
  const b = Math.min(255, Math.max(0, Math.round(rgb.b * factor)));

  return rgbToHex(r, g, b);
};

/**
 * 알파 채널 추가
 * 순수 함수
 */
export const withAlpha = (hex: string, alpha: number): string => {
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${alphaHex}`;
};

