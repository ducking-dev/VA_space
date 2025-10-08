/**
 * @file visualization.types.ts
 * @description 시각화 관련 TypeScript 타입 정의
 * @principle Single Responsibility - 시각화 관련 타입만 정의
 */

// ============================================================================
// Coordinate System Types
// ============================================================================

/**
 * 2D 좌표
 */
export interface IPoint2D {
  x: number;
  y: number;
}

/**
 * V-A 좌표 (Valence-Arousal)
 */
export interface IVACoordinate {
  valence: number;  // -1.0 ~ 1.0
  arousal: number;  // -1.0 ~ 1.0
}

/**
 * 화면 좌표
 */
export interface IScreenCoordinate {
  x: number;  // 픽셀 단위
  y: number;  // 픽셀 단위
}

/**
 * 좌표 변환 매핑
 */
export interface ICoordinateTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

// ============================================================================
// Viewport Types
// ============================================================================

/**
 * 뷰포트 정의
 */
export interface IViewport {
  x: number;
  y: number;
  width: number;
  height: number;
  scale?: number;
}

/**
 * 뷰포트 경계
 */
export interface IViewportBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * 줌 상태
 */
export interface IZoomState {
  scale: number;
  translateX: number;
  translateY: number;
  minScale: number;
  maxScale: number;
}

// ============================================================================
// Rendering Types
// ============================================================================

/**
 * 렌더링 옵션
 */
export interface IRenderOptions {
  showGrid?: boolean;
  showAxes?: boolean;
  showLabels?: boolean;
  showPrototypes?: boolean;
  enableAnimation?: boolean;
  animationDuration?: number;
}

/**
 * 렌더링 스타일
 */
export interface IRenderStyle {
  pointSize: number;
  pointOpacity: number;
  lineWidth: number;
  fontSize: number;
  fontFamily: string;
}

/**
 * 렌더링 레이어 타입
 */
export type RenderLayer = 'background' | 'grid' | 'axes' | 'points' | 'prototypes' | 'labels' | 'tooltip';

// ============================================================================
// Color Types
// ============================================================================

/**
 * RGB 색상
 */
export interface IRGB {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
}

/**
 * RGBA 색상
 */
export interface IRGBA extends IRGB {
  a: number;  // 0-1
}

/**
 * HSL 색상
 */
export interface IHSL {
  h: number;  // 0-360
  s: number;  // 0-100
  l: number;  // 0-100
}

/**
 * 색상 스케일 타입
 */
export type ColorScaleType = 'linear' | 'quantile' | 'threshold' | 'categorical';

/**
 * 색상 맵 설정
 */
export interface IColorMapConfig {
  type: ColorScaleType;
  domain: number[];
  range: string[];
  interpolate?: boolean;
}

// ============================================================================
// Scale Types
// ============================================================================

/**
 * 스케일 타입
 */
export type ScaleType = 'linear' | 'log' | 'sqrt' | 'pow';

/**
 * 스케일 설정
 */
export interface IScaleConfig {
  type: ScaleType;
  domain: [number, number];
  range: [number, number];
  clamp?: boolean;
  nice?: boolean;
}

/**
 * 축 설정
 */
export interface IAxisConfig {
  label: string;
  tickCount?: number;
  tickFormat?: (value: number) => string;
  showGrid?: boolean;
  gridColor?: string;
}

// ============================================================================
// Interaction Types
// ============================================================================

/**
 * 마우스 이벤트 타입
 */
export type MouseEventType = 'click' | 'mousemove' | 'mouseenter' | 'mouseleave' | 'mousedown' | 'mouseup';

/**
 * 터치 이벤트 타입
 */
export type TouchEventType = 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel';

/**
 * 상호작용 상태
 */
export interface IInteractionState {
  isHovering: boolean;
  isDragging: boolean;
  isPinching: boolean;
  hoveredItem?: any;
  selectedItems?: any[];
}

/**
 * 드래그 상태
 */
export interface IDragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
}

// ============================================================================
// Animation Types
// ============================================================================

/**
 * 애니메이션 이징 함수
 */
export type EasingFunction = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'elastic' | 'bounce';

/**
 * 애니메이션 설정
 */
export interface IAnimationConfig {
  duration: number;  // ms
  delay?: number;  // ms
  easing?: EasingFunction;
  loop?: boolean;
  yoyo?: boolean;
}

/**
 * 트랜지션 설정
 */
export interface ITransitionConfig {
  property: string;
  duration: number;
  easing?: EasingFunction;
  delay?: number;
}

// ============================================================================
// Tooltip Types
// ============================================================================

/**
 * 툴팁 위치
 */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

/**
 * 툴팁 설정
 */
export interface ITooltipConfig {
  placement?: TooltipPlacement;
  offset?: number;
  showDelay?: number;
  hideDelay?: number;
  followCursor?: boolean;
}

/**
 * 툴팁 데이터
 */
export interface ITooltipData {
  title: string;
  content: string | React.ReactNode;
  position: IPoint2D;
  visible: boolean;
}

// ============================================================================
// Layout Types
// ============================================================================

/**
 * 레이아웃 방향
 */
export type LayoutDirection = 'horizontal' | 'vertical';

/**
 * 정렬 방식
 */
export type AlignmentType = 'start' | 'center' | 'end' | 'stretch';

/**
 * 레이아웃 설정
 */
export interface ILayoutConfig {
  direction?: LayoutDirection;
  align?: AlignmentType;
  justify?: AlignmentType;
  gap?: number;
  padding?: number | [number, number, number, number];
}

// ============================================================================
// Performance Types
// ============================================================================

/**
 * 가상화 설정
 */
export interface IVirtualizationConfig {
  enabled: boolean;
  itemHeight?: number;
  overscan?: number;
  threshold?: number;
}

/**
 * 렌더링 성능 메트릭
 */
export interface IRenderMetrics {
  fps: number;
  renderTime: number;  // ms
  itemsRendered: number;
  itemsTotal: number;
  memoryUsage?: number;  // bytes
}

// ============================================================================
// Export Types
// ============================================================================

/**
 * 내보내기 형식
 */
export type ExportFormat = 'png' | 'svg' | 'pdf' | 'json' | 'csv';

/**
 * 내보내기 옵션
 */
export interface IExportOptions {
  format: ExportFormat;
  width?: number;
  height?: number;
  quality?: number;  // 0-1
  backgroundColor?: string;
  includeLabels?: boolean;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * IPoint2D 타입 가드
 */
export function isPoint2D(value: unknown): value is IPoint2D {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.x === 'number' && typeof v.y === 'number';
}

/**
 * IViewport 타입 가드
 */
export function isViewport(value: unknown): value is IViewport {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.x === 'number' &&
    typeof v.y === 'number' &&
    typeof v.width === 'number' &&
    typeof v.height === 'number'
  );
}

// ============================================================================
// Statistics Types
// ============================================================================

/**
 * 통계 데이터 구조
 */
export interface IDimensionStats {
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
}

/**
 * 전체 통계 정보
 */
export interface IStatistics {
  totalCount: number;
  multiwordCount: number;
  unigramCount: number;
  valenceStats: IDimensionStats;
  arousalStats: IDimensionStats;
  confidenceStats: IDimensionStats;
  strategyDistribution: Record<string, number>;
  quadrantDistribution: Record<string, number>;
}
