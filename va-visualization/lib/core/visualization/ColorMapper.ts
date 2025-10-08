/**
 * @file ColorMapper.ts
 * @description 감정 데이터를 색상으로 매핑하는 시스템
 * @principle Single Responsibility - 색상 매핑만 담당
 */

import {
  getConfidenceColor,
  getStrategyColor,
  getValenceColor,
  getArousalColor,
} from '@/lib/constants/colors.const';
import type { IEmotionData, IRenderablePoint } from '@/lib/types/emotion.types';

/**
 * 색상 매핑 전략 타입
 */
export type ColorMappingStrategy = 
  | 'confidence'
  | 'strategy'
  | 'valence'
  | 'arousal'
  | 'custom';

/**
 * 색상 매퍼 인터페이스
 */
export interface IColorMapper {
  getColor(emotion: IEmotionData): string;
  setStrategy(strategy: ColorMappingStrategy): void;
  getStrategy(): ColorMappingStrategy;
}

/**
 * 감정 데이터를 색상으로 매핑하는 클래스
 */
export class ColorMapper implements IColorMapper {
  private strategy: ColorMappingStrategy;
  private customColorFn?: (emotion: IEmotionData) => string;

  constructor(strategy: ColorMappingStrategy = 'confidence') {
    this.strategy = strategy;
  }

  /**
   * 현재 전략에 따라 색상 반환
   */
  public getColor(emotion: IEmotionData): string {
    switch (this.strategy) {
      case 'confidence':
        return this.getColorByConfidence(emotion);
      
      case 'strategy':
        return this.getColorByStrategy(emotion);
      
      case 'valence':
        return this.getColorByValence(emotion);
      
      case 'arousal':
        return this.getColorByArousal(emotion);
      
      case 'custom':
        return this.customColorFn?.(emotion) ?? this.getColorByConfidence(emotion);
      
      default:
        return this.getColorByConfidence(emotion);
    }
  }

  /**
   * 색상 매핑 전략 변경
   */
  public setStrategy(strategy: ColorMappingStrategy): void {
    this.strategy = strategy;
  }

  /**
   * 현재 색상 매핑 전략 반환
   */
  public getStrategy(): ColorMappingStrategy {
    return this.strategy;
  }

  /**
   * 커스텀 색상 함수 설정
   */
  public setCustomColorFunction(fn: (emotion: IEmotionData) => string): void {
    this.customColorFn = fn;
    this.strategy = 'custom';
  }

  /**
   * 신뢰도 기반 색상
   */
  private getColorByConfidence(emotion: IEmotionData): string {
    return getConfidenceColor(emotion.confidence);
  }

  /**
   * 병합 전략 기반 색상
   */
  private getColorByStrategy(emotion: IEmotionData): string {
    const strategyColors = getStrategyColor(emotion.mergeStrategy);
    return strategyColors.border;
  }

  /**
   * Valence 값 기반 색상
   */
  private getColorByValence(emotion: IEmotionData): string {
    return getValenceColor(emotion.valence);
  }

  /**
   * Arousal 값 기반 색상
   */
  private getColorByArousal(emotion: IEmotionData): string {
    return getArousalColor(emotion.arousal);
  }

  /**
   * 여러 감정 데이터를 색상으로 일괄 매핑
   */
  public batchGetColors(emotions: IEmotionData[]): string[] {
    return emotions.map((emotion) => this.getColor(emotion));
  }

  /**
   * 색상 맵 생성 (캐싱용)
   */
  public createColorMap(emotions: IEmotionData[]): Map<string, string> {
    const colorMap = new Map<string, string>();
    emotions.forEach((emotion) => {
      colorMap.set(emotion.term, this.getColor(emotion));
    });
    return colorMap;
  }
}

/**
 * 그라데이션 색상 매퍼 (Valence-Arousal 기반)
 */
export class GradientColorMapper extends ColorMapper {
  constructor() {
    super('custom');
    
    // V-A 평면의 4사분면에 따른 그라데이션
    this.setCustomColorFunction((emotion) => {
      const { valence, arousal } = emotion;
      
      // 1사분면 (V+, A+): 노랑 → 빨강
      if (valence >= 0 && arousal >= 0) {
        return this.interpolateColor('#FFE082', '#FF6B6B', (valence + arousal) / 2);
      }
      
      // 2사분면 (V-, A+): 빨강 → 보라
      if (valence < 0 && arousal >= 0) {
        return this.interpolateColor('#FF6B6B', '#B3B3FF', (-valence + arousal) / 2);
      }
      
      // 3사분면 (V-, A-): 보라 → 파랑
      if (valence < 0 && arousal < 0) {
        return this.interpolateColor('#B3B3FF', '#B3D9FF', (-valence - arousal) / 2);
      }
      
      // 4사분면 (V+, A-): 파랑 → 초록
      return this.interpolateColor('#B3D9FF', '#B3FFB3', (valence - arousal) / 2);
    });
  }

  /**
   * 두 색상 사이를 선형 보간
   */
  private interpolateColor(color1: string, color2: string, t: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    if (!c1 || !c2) return color1;
    
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    
    return this.rgbToHex(r, g, b);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
}

/**
 * 색상 매퍼 팩토리
 */
export class ColorMapperFactory {
  private static mappers = new Map<ColorMappingStrategy, ColorMapper>();

  /**
   * 색상 매퍼 생성 또는 반환
   */
  static getMapper(strategy: ColorMappingStrategy): ColorMapper {
    if (!this.mappers.has(strategy)) {
      if (strategy === 'custom') {
        this.mappers.set(strategy, new GradientColorMapper());
      } else {
        this.mappers.set(strategy, new ColorMapper(strategy));
      }
    }
    return this.mappers.get(strategy)!;
  }

  /**
   * 모든 매퍼 초기화
   */
  static reset(): void {
    this.mappers.clear();
  }
}

/**
 * 렌더링 가능한 포인트에 색상 추가
 */
export function enrichWithColor(
  emotion: IEmotionData,
  colorMapper: ColorMapper
): IRenderablePoint {
  return {
    term: emotion.term,
    x: 0, // CoordinateSystem에서 설정
    y: 0, // CoordinateSystem에서 설정
    valence: emotion.valence,
    arousal: emotion.arousal,
    confidence: emotion.confidence,
    mergeStrategy: emotion.mergeStrategy,
    isMultiword: emotion.isMultiword,
    color: colorMapper.getColor(emotion),
    size: emotion.isMultiword ? 4 : 3,
  };
}

/**
 * 여러 감정 데이터에 색상 추가
 */
export function batchEnrichWithColor(
  emotions: IEmotionData[],
  colorMapper: ColorMapper
): Omit<IRenderablePoint, 'x' | 'y'>[] {
  return emotions.map((emotion) => ({
    term: emotion.term,
    valence: emotion.valence,
    arousal: emotion.arousal,
    confidence: emotion.confidence,
    mergeStrategy: emotion.mergeStrategy,
    isMultiword: emotion.isMultiword,
    color: colorMapper.getColor(emotion),
    size: emotion.isMultiword ? 4 : 3,
  }));
}

