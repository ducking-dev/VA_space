/**
 * @file emotion.types.ts
 * @description 감정 데이터 관련 TypeScript 타입 정의
 * @principle Single Responsibility - 감정 데이터 타입만 정의
 */

// ============================================================================
// Core Emotion Data Types
// ============================================================================

/**
 * 원시 감정 데이터 (API/파일에서 받는 형식)
 * @note 실제 JSON 데이터 구조와 일치
 */
export interface IRawEmotionData {
  term: string;
  valence: number;
  arousal: number;
  dominance?: number;
  confidence?: number;
  merge_strategy?: string;
  source_warriner?: boolean;
  source_nrc?: boolean;
  is_multiword?: boolean;
}

/**
 * 정규화된 감정 데이터 (애플리케이션 내부에서 사용)
 */
export interface IEmotionData {
  term: string;
  valence: number;  // -1.0 ~ 1.0
  arousal: number;  // -1.0 ~ 1.0
  dominance?: number;  // -1.0 ~ 1.0
  confidence: number;  // 0.0 ~ 1.0
  mergeStrategy: 'both_weighted' | 'warriner_only' | 'nrc_only' | 'unknown';
  isMultiword: boolean;
  metadata?: IEmotionMetadata;
}

/**
 * 감정 메타데이터
 */
export interface IEmotionMetadata {
  sourceWarriner?: boolean;
  sourceNRC?: boolean;
  rawData?: IRawEmotionData;
}

/**
 * 렌더링 가능한 감정 포인트 (시각화용)
 */
export interface IRenderablePoint {
  term: string;
  x: number;  // 화면 좌표 X
  y: number;  // 화면 좌표 Y
  valence: number;
  arousal: number;
  confidence: number;
  mergeStrategy: string;
  isMultiword: boolean;
  color: string;
  size: number;
}

// ============================================================================
// Emotion Prototype Types
// ============================================================================

/**
 * 감정 프로토타입 (기본 감정 중심점)
 */
export interface IEmotionPrototype {
  name: string;
  valence: number;
  arousal: number;
  color: string;
  description?: string;
}

/**
 * 감정 프로토타입 컬렉션
 */
export type EmotionPrototypeMap = Record<string, IEmotionPrototype>;

// ============================================================================
// Filter and Search Types
// ============================================================================

/**
 * 감정 필터 조건
 */
export interface IEmotionFilter {
  searchTerm?: string;
  minValence?: number;
  maxValence?: number;
  minArousal?: number;
  maxArousal?: number;
  minConfidence?: number;
  maxConfidence?: number;
  mergeStrategies?: string[];
  includeMultiword?: boolean;
}

/**
 * 감정 정렬 기준
 */
export type EmotionSortField = 'term' | 'valence' | 'arousal' | 'confidence';

/**
 * 정렬 방향
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 정렬 옵션
 */
export interface IEmotionSortOptions {
  field: EmotionSortField;
  direction: SortDirection;
}

// ============================================================================
// Statistics Types
// ============================================================================

/**
 * 감정 통계
 */
export interface IEmotionStatistics {
  total: number;
  byStrategy: Record<string, number>;
  byConfidence: {
    high: number;  // >= 0.8
    medium: number;  // 0.7 ~ 0.8
    low: number;  // < 0.7
  };
  valenceRange: {
    min: number;
    max: number;
    mean: number;
    median: number;
  };
  arousalRange: {
    min: number;
    max: number;
    mean: number;
    median: number;
  };
}

// ============================================================================
// Data Loading Types
// ============================================================================

/**
 * 데이터 로딩 상태
 */
export type DataLoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * 데이터 로딩 결과
 */
export interface IDataLoadingResult<T> {
  state: DataLoadingState;
  data?: T;
  error?: Error;
  timestamp?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * 부분적 감정 데이터 업데이트
 */
export type PartialEmotionData = Partial<IEmotionData>;

/**
 * 감정 데이터 배열
 */
export type EmotionDataArray = IEmotionData[];

/**
 * 감정 데이터 맵 (term을 키로)
 */
export type EmotionDataMap = Map<string, IEmotionData>;

/**
 * 감정 데이터 검증 결과
 */
export interface IEmotionDataValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * IRawEmotionData 타입 가드
 */
export function isRawEmotionData(data: unknown): data is IRawEmotionData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.term === 'string' &&
    typeof d.valence === 'number' &&
    typeof d.arousal === 'number'
  );
}

/**
 * IEmotionData 타입 가드
 */
export function isEmotionData(data: unknown): data is IEmotionData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.term === 'string' &&
    typeof d.valence === 'number' &&
    typeof d.arousal === 'number' &&
    typeof d.confidence === 'number' &&
    typeof d.isMultiword === 'boolean'
  );
}

/**
 * IRenderablePoint 타입 가드
 */
export function isRenderablePoint(data: unknown): data is IRenderablePoint {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.term === 'string' &&
    typeof d.x === 'number' &&
    typeof d.y === 'number' &&
    typeof d.color === 'string'
  );
}


