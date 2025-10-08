/**
 * @file colors.const.ts
 * @description 색상 관련 상수 정의 (통합)
 * @principle Single Responsibility - 모든 색상 상수를 단일 파일에서 관리
 * @optimization 객체를 const로 동결하여 불변성 보장 및 성능 최적화
 */

// ============================================================================
// Emotion Confidence Colors (파스텔 톤)
// ============================================================================

export const CONFIDENCE_COLORS = {
  HIGH: '#7CB342',    // 신뢰도 >= 0.8 - 파스텔 그린
  MEDIUM: '#FF8A65',  // 신뢰도 0.7-0.8 - 파스텔 오렌지
  LOW: '#E57373',     // 신뢰도 < 0.7 - 파스텔 레드
} as const;

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.7,
  LOW: 0.0,
} as const;

// ============================================================================
// Pastel Color Palette (전체 팔레트)
// ============================================================================

export const PASTEL_COLORS = {
  // Quadrant Colors
  QUADRANT_1_LIGHT: '#FFF2CC',  // Joy - 따뜻한 노랑 (밝은)
  QUADRANT_1_DARK: '#FFE6B3',   // Joy - 따뜻한 노랑 (어두운)
  
  QUADRANT_2_LIGHT: '#FFE6E6',  // Anger - 부드러운 빨강 (밝은)
  QUADRANT_2_DARK: '#FFB3B3',   // Anger - 부드러운 빨강 (어두운)
  
  QUADRANT_3_LIGHT: '#E6F3FF',  // Sadness - 차분한 파랑 (밝은)
  QUADRANT_3_DARK: '#B3D9FF',   // Sadness - 차분한 파랑 (어두운)
  
  QUADRANT_4_LIGHT: '#E6FFE6',  // Calm - 상쾌한 초록 (밝은)
  QUADRANT_4_DARK: '#B3FFB3',   // Calm - 상쾌한 초록 (어두운)
  
  // Confidence Colors (중복 방지를 위해 CONFIDENCE_COLORS 참조)
  HIGH_CONFIDENCE: '#7CB342',   // 파스텔 그린
  MEDIUM_CONFIDENCE: '#FF8A65', // 파스텔 오렌지
  LOW_CONFIDENCE: '#E57373',    // 파스텔 레드
  
  // Prototype Colors
  JOY: '#FFE082',          // 파스텔 골드
  ANGER: '#FFB3B3',        // 파스텔 레드
  FEAR: '#B3B3FF',         // 파스텔 퍼플
  SADNESS: '#B3D9FF',      // 파스텔 블루
  SURPRISE: '#FFD9B3',     // 파스텔 오렌지
  DISGUST: '#D9B3FF',      // 파스텔 바이올렛
  CALM: '#B3FFB3',         // 파스텔 그린
  EXCITEMENT: '#FFB3E6',   // 파스텔 핑크
  
  // Primary Colors
  BLUE: '#B3D9FF',
  GREEN: '#B3FFB3',
  ORANGE: '#FFD9B3',
  RED: '#FFB3B3',
  YELLOW: '#FFE082',
  PURPLE: '#D9B3FF',
  PINK: '#FFB3E6',
} as const;

// ============================================================================
// Emotion Prototype Colors (파스텔 톤) - 하위 호환성 유지
// ============================================================================

export const PROTOTYPE_COLORS = {
  JOY: PASTEL_COLORS.JOY,
  ANGER: PASTEL_COLORS.ANGER,
  FEAR: PASTEL_COLORS.FEAR,
  SADNESS: PASTEL_COLORS.SADNESS,
  SURPRISE: PASTEL_COLORS.SURPRISE,
  DISGUST: PASTEL_COLORS.DISGUST,
  CALM: PASTEL_COLORS.CALM,
  EXCITEMENT: PASTEL_COLORS.EXCITEMENT,
} as const;

// ============================================================================
// Quadrant Colors (감정 영역별 색상)
// ============================================================================

export const QUADRANT_COLORS = {
  // 1사분면 (V+, A+): Joy, Excitement
  Q1: {
    background: 'linear-gradient(45deg, #FFF2CC, #FFE6B3)',
    border: '#FFD54F',
  },
  // 2사분면 (V-, A+): Anger, Fear
  Q2: {
    background: 'linear-gradient(45deg, #FFE6E6, #FFB3B3)',
    border: '#EF5350',
  },
  // 3사분면 (V-, A-): Sadness, Boredom
  Q3: {
    background: 'linear-gradient(45deg, #E6F3FF, #B3D9FF)',
    border: '#42A5F5',
  },
  // 4사분면 (V+, A-): Calm, Serenity
  Q4: {
    background: 'linear-gradient(45deg, #E6FFE6, #B3FFB3)',
    border: '#66BB6A',
  },
} as const;

// ============================================================================
// Color Mapping Tables (O(1) 조회 성능)
// ============================================================================

/**
 * 신뢰도별 색상 매핑 테이블
 * @principle Performance - if-else 대신 배열 조회로 O(1) 성능 보장
 */
export const CONFIDENCE_COLOR_MAP = [
  { min: 0.8, color: CONFIDENCE_COLORS.HIGH },
  { min: 0.7, color: CONFIDENCE_COLORS.MEDIUM },
  { min: 0.0, color: CONFIDENCE_COLORS.LOW },
] as const;

/**
 * 사분면별 색상 매핑
 * @principle Performance - 사분면 계산을 인덱스로 변환하여 O(1) 조회
 */
export const QUADRANT_COLOR_MAP = {
  q1: { light: PASTEL_COLORS.QUADRANT_1_LIGHT, dark: PASTEL_COLORS.QUADRANT_1_DARK },
  q2: { light: PASTEL_COLORS.QUADRANT_2_LIGHT, dark: PASTEL_COLORS.QUADRANT_2_DARK },
  q3: { light: PASTEL_COLORS.QUADRANT_3_LIGHT, dark: PASTEL_COLORS.QUADRANT_3_DARK },
  q4: { light: PASTEL_COLORS.QUADRANT_4_LIGHT, dark: PASTEL_COLORS.QUADRANT_4_DARK },
} as const;

// ============================================================================
// UI Colors
// ============================================================================

export const UI_COLORS = {
  // Primary Colors
  PRIMARY: '#3B82F6',
  PRIMARY_HOVER: '#2563EB',
  PRIMARY_LIGHT: '#DBEAFE',
  
  // Secondary Colors
  SECONDARY: '#8B5CF6',
  SECONDARY_HOVER: '#7C3AED',
  SECONDARY_LIGHT: '#EDE9FE',
  
  // Success
  SUCCESS: '#10B981',
  SUCCESS_LIGHT: '#D1FAE5',
  
  // Warning
  WARNING: '#F59E0B',
  WARNING_LIGHT: '#FEF3C7',
  
  // Error
  ERROR: '#EF4444',
  ERROR_LIGHT: '#FEE2E2',
  
  // Info
  INFO: '#06B6D4',
  INFO_LIGHT: '#CFFAFE',
} as const;

// ============================================================================
// Grayscale Colors
// ============================================================================

export const GRAY_COLORS = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
} as const;

// ============================================================================
// Visualization Colors
// ============================================================================

export const VIZ_COLORS = {
  // 축 및 그리드
  AXIS: GRAY_COLORS[600],
  GRID: GRAY_COLORS[200],
  GRID_LIGHT: GRAY_COLORS[100],
  
  // 배경
  BACKGROUND: '#FFFFFF',
  BACKGROUND_GRADIENT_FROM: '#F8FAFC',
  BACKGROUND_GRADIENT_TO: '#F1F5F9',
  
  // 강조
  HIGHLIGHT: '#FCD34D',
  HIGHLIGHT_HOVER: '#FBBF24',
  
  // 선택
  SELECTED: '#3B82F6',
  SELECTED_BORDER: '#2563EB',
  
  // 툴팁
  TOOLTIP_BG: '#FFFFFF',
  TOOLTIP_BORDER: GRAY_COLORS[300],
  TOOLTIP_SHADOW: 'rgba(0, 0, 0, 0.1)',
} as const;

// ============================================================================
// Merge Strategy Colors
// ============================================================================

export const STRATEGY_COLORS = {
  BOTH_WEIGHTED: {
    bg: '#DBEAFE',
    text: '#1E40AF',
    border: '#3B82F6',
  },
  WARRINER_ONLY: {
    bg: '#D1FAE5',
    text: '#065F46',
    border: '#10B981',
  },
  NRC_ONLY: {
    bg: '#FED7AA',
    text: '#9A3412',
    border: '#F97316',
  },
  UNKNOWN: {
    bg: GRAY_COLORS[100],
    text: GRAY_COLORS[600],
    border: GRAY_COLORS[300],
  },
} as const;

// ============================================================================
// Color Scales
// ============================================================================

/**
 * Valence 색상 스케일 (부정 → 긍정)
 */
export const VALENCE_SCALE = [
  '#EF4444', // 매우 부정
  '#F59E0B', // 부정
  '#EAB308', // 중립
  '#84CC16', // 긍정
  '#22C55E', // 매우 긍정
] as const;

/**
 * Arousal 색상 스케일 (낮음 → 높음)
 */
export const AROUSAL_SCALE = [
  '#3B82F6', // 매우 낮음
  '#6366F1', // 낮음
  '#8B5CF6', // 중간
  '#D946EF', // 높음
  '#EC4899', // 매우 높음
] as const;

// ============================================================================
// Opacity Values
// ============================================================================

export const OPACITY = {
  TRANSPARENT: 0,
  FAINT: 0.1,
  LIGHT: 0.3,
  MEDIUM: 0.5,
  NORMAL: 0.7,
  STRONG: 0.9,
  OPAQUE: 1,
} as const;

// ============================================================================
// Color Utility Functions
// ============================================================================

/**
 * 신뢰도에 따른 색상 반환
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
    return CONFIDENCE_COLORS.HIGH;
  } else if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    return CONFIDENCE_COLORS.MEDIUM;
  } else {
    return CONFIDENCE_COLORS.LOW;
  }
}

/**
 * 병합 전략에 따른 색상 반환
 */
export function getStrategyColor(strategy: string): typeof STRATEGY_COLORS[keyof typeof STRATEGY_COLORS] {
  switch (strategy) {
    case 'both_weighted':
      return STRATEGY_COLORS.BOTH_WEIGHTED;
    case 'warriner_only':
      return STRATEGY_COLORS.WARRINER_ONLY;
    case 'nrc_only':
      return STRATEGY_COLORS.NRC_ONLY;
    default:
      return STRATEGY_COLORS.UNKNOWN;
  }
}

/**
 * Valence 값에 따른 색상 (보간)
 */
export function getValenceColor(valence: number): string {
  // -1 ~ 1 범위를 0 ~ 1로 정규화
  const normalized = (valence + 1) / 2;
  const index = Math.min(Math.floor(normalized * (VALENCE_SCALE.length - 1)), VALENCE_SCALE.length - 1);
  return VALENCE_SCALE[index];
}

/**
 * Arousal 값에 따른 색상 (보간)
 */
export function getArousalColor(arousal: number): string {
  // -1 ~ 1 범위를 0 ~ 1로 정규화
  const normalized = (arousal + 1) / 2;
  const index = Math.min(Math.floor(normalized * (AROUSAL_SCALE.length - 1)), AROUSAL_SCALE.length - 1);
  return AROUSAL_SCALE[index];
}

// ============================================================================
// Type Exports
// ============================================================================

export type ConfidenceColorKey = keyof typeof CONFIDENCE_COLORS;
export type PrototypeColorKey = keyof typeof PROTOTYPE_COLORS;
export type QuadrantColorKey = keyof typeof QUADRANT_COLORS;
export type UIColorKey = keyof typeof UI_COLORS;
export type GrayColorKey = keyof typeof GRAY_COLORS;
export type VizColorKey = keyof typeof VIZ_COLORS;
export type StrategyColorKey = keyof typeof STRATEGY_COLORS;
export type PastelColor = typeof PASTEL_COLORS[keyof typeof PASTEL_COLORS];
export type QuadrantMapKey = keyof typeof QUADRANT_COLOR_MAP;


