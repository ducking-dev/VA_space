
import type { IEmotionData } from '@/lib/types/emotion.types';

/**
 * @interface IDataLoader
 * @description 데이터 로딩 전략에 대한 공통 인터페이스
 */
export interface IDataLoader {
  /**
   * 모든 감정 데이터를 로드합니다.
   */
  loadData(): Promise<IEmotionData[]>;
}

/**
 * @interface IProgressiveDataLoader
 * @description 점진적 데이터 로딩을 지원하는 데이터 로더 인터페이스
 */
export interface IProgressiveDataLoader extends IDataLoader {
  /**
   * 데이터를 점진적으로 로드하며, 진행 상태와 각 청크를 콜백으로 전달합니다.
   * @param onProgress - (progress: number, chunk: T[]) => void 형식의 콜백
   */
  loadDataProgressively(onProgress: (progress: number, chunk: IEmotionData[]) => void): Promise<void>;
}
