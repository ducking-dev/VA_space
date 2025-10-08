/**
 * @file emotion.ts
 * @description 감정 데이터 타입 정의 (ISP - Interface Segregation Principle)
 * 각 인터페이스는 특정 목적에만 집중하여 설계
 */

// ============================================================================
// Core Emotion Interfaces
// ============================================================================

/**
 * 기본 감정 좌표 인터페이스
 * SRP: 좌표 정보만 담당
 */
export interface IEmotionCoordinate {
  readonly valence: number;  // -1 ~ 1
  readonly arousal: number;  // -1 ~ 1
}

/**
 * 감정 메타데이터 인터페이스
 * SRP: 메타 정보만 담당
 */
export interface IEmotionMetadata {
  readonly term: string;
  readonly confidence: number;  // 0 ~ 1
  readonly merge_strategy: MergeStrategy;
  readonly is_multiword?: boolean;
}

/**
 * 완전한 감정 데이터 인터페이스
 * OCP: 확장에 열려있고 수정에 닫혀있음
 */
export interface IEmotionPoint extends IEmotionCoordinate, IEmotionMetadata {}

/**
 * 병합 전략 타입
 */
export type MergeStrategy = 
  | 'both_weighted' 
  | 'warriner_only' 
  | 'nrc_only';

// ============================================================================
// Prototype Interfaces
// ============================================================================

/**
 * 감정 프로토타입 인터페이스
 * SRP: 프로토타입 정보만 담당
 */
export interface IEmotionPrototype extends IEmotionCoordinate {
  readonly name: string;
  readonly color: string;
}

// ============================================================================
// Visualization Interfaces
// ============================================================================

/**
 * 렌더링 가능한 점 인터페이스
 * ISP: 렌더링에 필요한 속성만 정의
 */
export interface IRenderablePoint extends IEmotionPoint {
  readonly id: string;
  readonly color: string;
  readonly size: number;
}

/**
 * 뷰포트 인터페이스
 * SRP: 뷰포트 경계만 담당
 */
export interface IViewport {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * 툴팁 위치 인터페이스
 */
export interface ITooltipPosition {
  readonly x: number;
  readonly y: number;
}

// ============================================================================
// Service Interfaces (DIP - Dependency Inversion Principle)
// ============================================================================

/**
 * 데이터 로더 인터페이스
 * DIP: 추상화에 의존
 */
export interface IEmotionDataLoader {
  load(): Promise<IEmotionPoint[]>;
  loadOptimized(): Promise<IRenderablePoint[]>;
}

/**
 * 데이터 필터 인터페이스
 * SRP: 필터링만 담당
 */
export interface IEmotionFilter {
  filter(emotions: IEmotionPoint[], query: string): IEmotionPoint[];
}

/**
 * 가상화 렌더러 인터페이스
 * SRP: 가상화만 담당
 */
export interface IVirtualizationService {
  getVisiblePoints(points: IRenderablePoint[], viewport: IViewport): IRenderablePoint[];
  updateViewport(viewport: IViewport): void;
}

/**
 * 색상 매핑 인터페이스
 * SRP: 색상 계산만 담당
 */
export interface IColorMapper {
  getPointColor(confidence: number): string;
  getQuadrantColor(valence: number, arousal: number): string;
}

// ============================================================================
// Component Props Interfaces
// ============================================================================

/**
 * 산점도 Props
 */
export interface IScatterPlotProps {
  readonly emotions: IRenderablePoint[];
  readonly onHover: (point: IEmotionPoint | null) => void;
  readonly viewport?: IViewport;
}

/**
 * 툴팁 Props
 */
export interface IEmotionTooltipProps {
  readonly point: IEmotionPoint;
  readonly position: ITooltipPosition;
}

/**
 * 프로토타입 Props
 */
export interface IEmotionPrototypesProps {
  readonly prototypes: IEmotionPrototype[];
  readonly visible?: boolean;
}

// ============================================================================
// Performance Optimization Types
// ============================================================================

/**
 * 메모이제이션 키 타입
 */
export type MemoKey = string;

/**
 * 캐시 엔트리 인터페이스
 */
export interface ICacheEntry<T> {
  readonly data: T;
  readonly timestamp: number;
  readonly ttl: number;
}

/**
 * 캐시 서비스 인터페이스
 * SRP: 캐싱만 담당
 */
export interface ICacheService<T> {
  get(key: MemoKey): T | null;
  set(key: MemoKey, data: T, ttl?: number): void;
  clear(): void;
  has(key: MemoKey): boolean;
}

// ============================================================================
// Statistics Interfaces
// ============================================================================

/**
 * 통계 정보 인터페이스
 */
export interface IEmotionStatistics {
  readonly total: number;
  readonly byStrategy: Record<MergeStrategy, number>;
  readonly averageConfidence: number;
  readonly quadrantDistribution: {
    q1: number;  // V+, A+
    q2: number;  // V-, A+
    q3: number;  // V-, A-
    q4: number;  // V+, A-
  };
}

