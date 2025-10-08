/**
 * @file visualization.ts
 * @description 시각화 관련 상수 정의
 * 성능 최적화: 매직 넘버 제거 및 타입 안전성 보장
 */

import { IEmotionPrototype } from '../types/emotion';
import { PASTEL_COLORS } from './colors.const';

// ============================================================================
// Coordinate System Constants
// ============================================================================

export const COORDINATE_SYSTEM = {
  MIN_VALENCE: -1.0,
  MAX_VALENCE: 1.0,
  MIN_AROUSAL: -1.0,
  MAX_AROUSAL: 1.0,
  CENTER_X: 0.0,
  CENTER_Y: 0.0,
} as const;

// ============================================================================
// Viewport Constants
// ============================================================================

export const DEFAULT_VIEWPORT = {
  x: -1.1,
  y: -1.1,
  width: 2.2,
  height: 2.2,
} as const;

export const SVG_DIMENSIONS = {
  WIDTH: 800,
  HEIGHT: 600,
  VIEW_BOX: '-1.1 -1.1 2.2 2.2',
} as const;

// ============================================================================
// Point Rendering Constants
// ============================================================================

export const POINT_SIZES = {
  SINGLE_WORD: 3,
  MULTI_WORD: 4,
  PROTOTYPE: 8,
  HOVER_SCALE: 1.5,
} as const;

export const OPACITY = {
  DEFAULT: 0.7,
  HOVER: 1.0,
  HIDDEN: 0,
} as const;

// ============================================================================
// Animation Constants (성능 최적화)
// ============================================================================

export const ANIMATION = {
  // 점 애니메이션
  POINT_DURATION: 0.3,
  POINT_DELAY_FACTOR: 0.0001,  // 54,893개 * 0.0001 = 약 5.5초 (스태거드)
  
  // Hover 애니메이션
  HOVER_DURATION: 0.2,
  
  // 프로토타입 애니메이션
  PROTOTYPE_DURATION: 0.5,
  PROTOTYPE_DELAY_FACTOR: 0.1,
  
  // 툴팁 애니메이션
  TOOLTIP_DURATION: 0.2,
  
  // Easing
  EASE: 'easeOut' as const,
} as const;

// ============================================================================
// Performance Optimization Constants
// ============================================================================

export const PERFORMANCE = {
  // 가상화 설정
  VIEWPORT_BUFFER: 0.1,  // 뷰포트 버퍼 (10%)
  MAX_VISIBLE_POINTS: 10000,  // 최대 렌더링 점 개수
  
  // 캐싱 설정
  CACHE_TTL: 60000,  // 1분 (밀리초)
  MAX_CACHE_SIZE: 100,
  
  // 디바운스/스로틀
  SEARCH_DEBOUNCE: 300,  // 300ms
  VIEWPORT_THROTTLE: 100,  // 100ms
  
  // 청크 크기
  CHUNK_SIZE: 1000,
  
  // 메모리 최적화
  MAX_TOOLTIP_CACHE: 50,
} as const;

// ============================================================================
// Emotion Prototypes (불변 데이터)
// ============================================================================

/**
 * 감정 프로토타입 정의
 * 성능: Object.freeze로 런타임 최적화
 */
export const EMOTION_PROTOTYPES: readonly IEmotionPrototype[] = [
  { name: 'Joy', valence: 0.80, arousal: 0.55, color: PASTEL_COLORS.JOY },
  { name: 'Anger', valence: -0.70, arousal: 0.70, color: PASTEL_COLORS.ANGER },
  { name: 'Fear', valence: -0.75, arousal: 0.75, color: PASTEL_COLORS.FEAR },
  { name: 'Sadness', valence: -0.70, arousal: -0.30, color: PASTEL_COLORS.SADNESS },
  { name: 'Surprise', valence: 0.00, arousal: 0.70, color: PASTEL_COLORS.SURPRISE },
  { name: 'Disgust', valence: -0.65, arousal: 0.35, color: PASTEL_COLORS.DISGUST },
  { name: 'Calm', valence: 0.40, arousal: -0.40, color: PASTEL_COLORS.CALM },
  { name: 'Excitement', valence: 0.60, arousal: 0.80, color: PASTEL_COLORS.EXCITEMENT },
] as const;

// ============================================================================
// Grid Constants
// ============================================================================

export const GRID = {
  CELL_SIZE: 0.1,
  STROKE_WIDTH: 0.5,
  STROKE_COLOR: '#e5e7eb',
} as const;

// ============================================================================
// Tooltip Constants
// ============================================================================

export const TOOLTIP = {
  OFFSET_X: 10,
  OFFSET_Y: -10,
  MAX_WIDTH: 320,  // 20rem = 320px
  Z_INDEX: 10,
} as const;

// ============================================================================
// API Constants
// ============================================================================

export const API_ROUTES = {
  EMOTIONS: '/api/emotions',
  SEARCH: '/api/search',
  STATISTICS: '/api/statistics',
} as const;

// ============================================================================
// Data File Paths
// ============================================================================

export const DATA_PATHS = {
  MERGED_VAD_CSV: '../data/processed/merged_vad.csv',
  MERGED_VAD_JSON: '../public/data/merged_vad.json',
} as const;

