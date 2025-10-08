/**
 * @file EmotionDataTransformer.ts
 * @description 감정 데이터 변환 로직
 * @principle Single Responsibility - 데이터 변환만 담당
 * @principle Open/Closed - 확장 가능하지만 수정에는 닫혀있음
 */

import type { IEmotionData, IRenderablePoint } from '@/lib/types/emotion.types';
import { getConfidenceColor } from '@/lib/constants/colors.const';
import { POINT_SIZE } from '@/lib/constants/visualization.const';

/**
 * 감정 데이터 변환기 인터페이스
 * @principle Interface Segregation - 필요한 메서드만 정의
 */
export interface IEmotionDataTransformer {
  transformToRenderable(
    emotions: IEmotionData[], 
    canvasWidth: number, 
    canvasHeight: number
  ): IRenderablePoint[];
}

/**
 * 감정 데이터 변환기 구현체
 * @principle Single Responsibility - 데이터 변환만 담당
 */
export class EmotionDataTransformer implements IEmotionDataTransformer {
  /**
   * IEmotionData를 IRenderablePoint로 변환
   * @principle Open/Closed - 새로운 변환 로직 추가 시 확장 가능
   */
  transformToRenderable(
    emotions: IEmotionData[], 
    canvasWidth: number, 
    canvasHeight: number
  ): IRenderablePoint[] {
    console.log(`[EmotionDataTransformer] Starting transformation of ${emotions.length} emotions`);
    const result = emotions.map(emotion => this.transformSingleEmotion(emotion, canvasWidth, canvasHeight));
    console.log(`[EmotionDataTransformer] Transformation completed - ${result.length} renderable points created`);
    return result;
  }

  /**
   * 단일 감정 데이터 변환
   * @principle Single Responsibility - 단일 변환만 담당
   */
  private transformSingleEmotion(
    emotion: IEmotionData, 
    canvasWidth: number, 
    canvasHeight: number
  ): IRenderablePoint {
    // 신뢰도에 따른 색상 결정
    const color = getConfidenceColor(emotion.confidence);
    
    // 다중어 여부에 따른 크기 결정
    const size = emotion.isMultiword ? POINT_SIZE.MULTIWORD : POINT_SIZE.DEFAULT;
    
    return {
      term: emotion.term,
      x: emotion.valence, // V-A 좌표계 직접 사용
      y: emotion.arousal, // V-A 좌표계 직접 사용
      valence: emotion.valence,
      arousal: emotion.arousal,
      confidence: emotion.confidence,
      mergeStrategy: emotion.mergeStrategy,
      isMultiword: emotion.isMultiword,
      color,
      size,
    };
  }
}

/**
 * 변환기 팩토리
 * @principle Factory Pattern - 객체 생성 책임 분리
 */
export class EmotionDataTransformerFactory {
  /**
   * 기본 변환기 생성
   * @principle Dependency Inversion - 인터페이스에 의존
   */
  static createDefault(): IEmotionDataTransformer {
    return new EmotionDataTransformer();
  }
  
  /**
   * 커스텀 변환기 생성 (확장 가능)
   * @principle Open/Closed - 새로운 변환기 추가 시 확장 가능
   */
  static createCustom(transformer: IEmotionDataTransformer): IEmotionDataTransformer {
    return transformer;
  }
}

