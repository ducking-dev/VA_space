/**
 * @file visualization.const.ts
 * @description 시각화 관련 상수 정의
 * @principle Single Responsibility - 시각화 설정 상수만 정의
 */

import type { IEmotionPrototype } from '../types/emotion.types';
import { PROTOTYPE_COLORS } from './colors.const';

// ============================================================================
// Coordinate System Constants
// ============================================================================

/**
 * V-A 좌표계 범위
 */
export const VA_COORDINATE_RANGE = {
  VALENCE: {
    MIN: -1.0,
    MAX: 1.0,
  },
  AROUSAL: {
    MIN: -1.0,
    MAX: 1.0,
  },
} as const;

/**
 * 화면 크기 기본값
 */
export const DEFAULT_CANVAS_SIZE = {
  WIDTH: 800,
  HEIGHT: 600,
  ASPECT_RATIO: 4 / 3,
} as const;

/**
 * 여백 (padding)
 */
export const CANVAS_PADDING = {
  TOP: 40,
  RIGHT: 40,
  BOTTOM: 60,
  LEFT: 60,
} as const;

// ============================================================================
// Point Rendering Constants
// ============================================================================

/**
 * 점 크기
 */
export const POINT_SIZE = {
  DEFAULT: 3,
  MULTIWORD: 4,
  PROTOTYPE: 8,
  HOVERED: 6,
  SELECTED: 7,
  MIN: 2,
  MAX: 12,
} as const;

/**
 * 점 투명도
 */
export const POINT_OPACITY = {
  DEFAULT: 0.7,
  HOVERED: 1.0,
  FADED: 0.3,
  HIDDEN: 0,
} as const;

// ============================================================================
// Grid Constants
// ============================================================================

/**
 * 그리드 설정
 */
export const GRID_CONFIG = {
  ENABLED: true,
  LINE_WIDTH: 0.5,
  TICK_COUNT: 10,
  SHOW_LABELS: true,
  LABEL_OFFSET: 10,
} as const;

// ============================================================================
// Axis Constants
// ============================================================================

/**
 * 축 설정
 */
export const AXIS_CONFIG = {
  LINE_WIDTH: 2,
  ARROW_SIZE: 10,
  LABEL_FONT_SIZE: 14,
  LABEL_FONT_FAMILY: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  TICK_LENGTH: 5,
} as const;

/**
 * 축 라벨
 */
export const AXIS_LABELS = {
  VALENCE: 'Valence (Pleasure-Displeasure)',
  AROUSAL: 'Arousal (Activation-Deactivation)',
  DOMINANCE: 'Dominance (Control-Submission)',
} as const;

// ============================================================================
// Emotion Prototypes
// ============================================================================

/**
 * 기본 감정 프로토타입 좌표
 */
export const EMOTION_PROTOTYPES: Record<string, IEmotionPrototype> = {
  JOY: {
    name: 'Joy',
    valence: 0.80,
    arousal: 0.55,
    color: PROTOTYPE_COLORS.JOY,
    description: '기쁨, 행복',
  },
  ANGER: {
    name: 'Anger',
    valence: -0.70,
    arousal: 0.70,
    color: PROTOTYPE_COLORS.ANGER,
    description: '분노, 화',
  },
  FEAR: {
    name: 'Fear',
    valence: -0.75,
    arousal: 0.75,
    color: PROTOTYPE_COLORS.FEAR,
    description: '두려움, 공포',
  },
  SADNESS: {
    name: 'Sadness',
    valence: -0.70,
    arousal: -0.30,
    color: PROTOTYPE_COLORS.SADNESS,
    description: '슬픔, 우울',
  },
  SURPRISE: {
    name: 'Surprise',
    valence: 0.00,
    arousal: 0.70,
    color: PROTOTYPE_COLORS.SURPRISE,
    description: '놀람, 경악',
  },
  DISGUST: {
    name: 'Disgust',
    valence: -0.65,
    arousal: 0.35,
    color: PROTOTYPE_COLORS.DISGUST,
    description: '혐오, 역겨움',
  },
  CALM: {
    name: 'Calm',
    valence: 0.40,
    arousal: -0.40,
    color: PROTOTYPE_COLORS.CALM,
    description: '평온, 고요',
  },
  EXCITEMENT: {
    name: 'Excitement',
    valence: 0.60,
    arousal: 0.80,
    color: PROTOTYPE_COLORS.EXCITEMENT,
    description: '흥분, 자극',
  },
} as const;

// ============================================================================
// Animation Constants
// ============================================================================

/**
 * 애니메이션 지속 시간 (ms)
 */
export const ANIMATION_DURATION = {
  INSTANT: 0,
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

/**
 * 애니메이션 딜레이
 */
export const ANIMATION_DELAY = {
  NONE: 0,
  SHORT: 50,
  MEDIUM: 100,
  LONG: 200,
  STAGGER_BASE: 0.0001,  // 스태거드 애니메이션 기본 딜레이
} as const;

/**
 * 이징 함수
 */
export const EASING_FUNCTIONS = {
  LINEAR: 'linear',
  EASE_IN: 'easeIn',
  EASE_OUT: 'easeOut',
  EASE_IN_OUT: 'easeInOut',
  ELASTIC: 'elastic',
  BOUNCE: 'bounce',
} as const;

// ============================================================================
// Interaction Constants
// ============================================================================

/**
 * 호버 설정
 */
export const HOVER_CONFIG = {
  ENABLED: true,
  RADIUS: 10,  // 호버 감지 반경 (픽셀)
  DELAY: 100,  // 호버 시작 딜레이 (ms)
  SCALE: 1.5,  // 호버 시 크기 배율
} as const;

/**
 * 클릭 설정
 */
export const CLICK_CONFIG = {
  ENABLED: true,
  THRESHOLD: 5,  // 클릭 허용 오차 (픽셀)
  DOUBLE_CLICK_DELAY: 300,  // 더블클릭 인식 시간 (ms)
} as const;

/**
 * 드래그 설정
 */
export const DRAG_CONFIG = {
  ENABLED: true,
  THRESHOLD: 5,  // 드래그 시작 threshold (픽셀)
  INERTIA: 0.9,  // 관성 계수 (0-1)
} as const;

/**
 * 줌 설정
 */
export const ZOOM_CONFIG = {
  ENABLED: true,
  MIN_SCALE: 0.5,
  MAX_SCALE: 10.0,
  STEP: 0.1,
  WHEEL_SENSITIVITY: 0.001,
} as const;

// ============================================================================
// Tooltip Constants
// ============================================================================

/**
 * 툴팁 설정
 */
export const TOOLTIP_CONFIG = {
  ENABLED: true,
  OFFSET_X: 10,
  OFFSET_Y: -10,
  MAX_WIDTH: 300,
  PADDING: 12,
  BORDER_RADIUS: 8,
  FONT_SIZE: 14,
  SHOW_DELAY: 200,  // ms
  HIDE_DELAY: 100,  // ms
  Z_INDEX: 1000,
} as const;

// ============================================================================
// Performance Constants
// ============================================================================

/**
 * 가상화 설정
 */
export const VIRTUALIZATION_CONFIG = {
  ENABLED: true,
  THRESHOLD: 1000,  // 이 개수 이상일 때 가상화 활성화
  OVERSCAN: 100,  // 뷰포트 밖 렌더링할 아이템 수
  CHUNK_SIZE: 500,  // 한 번에 렌더링할 최대 개수
} as const;

/**
 * 디바운스 설정 (ms)
 */
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  RESIZE: 150,
  SCROLL: 100,
  INPUT: 200,
} as const;

/**
 * 스로틀 설정 (ms)
 */
export const THROTTLE_DELAY = {
  MOUSE_MOVE: 16,  // ~60fps
  RESIZE: 100,
  SCROLL: 50,
} as const;

// ============================================================================
// Layout Constants
// ============================================================================

/**
 * 반응형 브레이크포인트
 */
export const BREAKPOINTS = {
  XS: 480,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const;

/**
 * Z-인덱스 레이어
 */
export const Z_INDEX = {
  BACKGROUND: 0,
  GRID: 1,
  POINTS: 10,
  PROTOTYPES: 20,
  LABELS: 30,
  TOOLTIP: 1000,
  MODAL: 2000,
} as const;

// ============================================================================
// Export Utility Functions
// ============================================================================

/**
 * 화면 좌표 → V-A 좌표 변환
 */
export function screenToVA(screenX: number, screenY: number, width: number, height: number): { valence: number; arousal: number } {
  const effectiveWidth = width - CANVAS_PADDING.LEFT - CANVAS_PADDING.RIGHT;
  const effectiveHeight = height - CANVAS_PADDING.TOP - CANVAS_PADDING.BOTTOM;
  
  const valence = ((screenX - CANVAS_PADDING.LEFT) / effectiveWidth) * 2 - 1;
  const arousal = 1 - ((screenY - CANVAS_PADDING.TOP) / effectiveHeight) * 2;
  
  return {
    valence: Math.max(VA_COORDINATE_RANGE.VALENCE.MIN, Math.min(VA_COORDINATE_RANGE.VALENCE.MAX, valence)),
    arousal: Math.max(VA_COORDINATE_RANGE.AROUSAL.MIN, Math.min(VA_COORDINATE_RANGE.AROUSAL.MAX, arousal)),
  };
}

/**
 * V-A 좌표 → 화면 좌표 변환
 */
export function vaToScreen(valence: number, arousal: number, width: number, height: number): { x: number; y: number } {
  const effectiveWidth = width - CANVAS_PADDING.LEFT - CANVAS_PADDING.RIGHT;
  const effectiveHeight = height - CANVAS_PADDING.TOP - CANVAS_PADDING.BOTTOM;
  
  const x = CANVAS_PADDING.LEFT + ((valence + 1) / 2) * effectiveWidth;
  const y = CANVAS_PADDING.TOP + ((1 - arousal) / 2) * effectiveHeight;
  
  return { x, y };
}

/**
 * 두 점 사이의 거리 계산
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * 점이 뷰포트 안에 있는지 확인
 */
export function isInViewport(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x <= width && y >= 0 && y <= height;
}

// ============================================================================
// Type Exports
// ============================================================================

export type EmotionPrototypeKey = keyof typeof EMOTION_PROTOTYPES;
export type AnimationDurationKey = keyof typeof ANIMATION_DURATION;
export type EasingFunctionKey = keyof typeof EASING_FUNCTIONS;


