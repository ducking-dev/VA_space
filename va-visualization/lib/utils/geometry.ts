/**
 * @file geometry.ts
 * @description 기하학적 계산 유틸리티 (순수 함수)
 * 성능 최적화: 불변성, 캐싱, 비트 연산
 */

import type { IEmotionCoordinate, IViewport } from '../types/emotion';
import { COORDINATE_SYSTEM } from '../constants/visualization';

// ============================================================================
// Distance Calculations (순수 함수)
// ============================================================================

/**
 * 유클리드 거리 계산
 * 성능: 제곱근 계산 최소화
 */
export const euclideanDistance = (
  p1: IEmotionCoordinate,
  p2: IEmotionCoordinate
): number => {
  const dx = p1.valence - p2.valence;
  const dy = p1.arousal - p2.arousal;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 제곱 거리 계산 (제곱근 생략으로 성능 향상)
 * 비교만 필요할 때 사용
 */
export const squaredDistance = (
  p1: IEmotionCoordinate,
  p2: IEmotionCoordinate
): number => {
  const dx = p1.valence - p2.valence;
  const dy = p1.arousal - p2.arousal;
  return dx * dx + dy * dy;
};

/**
 * 맨해튼 거리 계산
 * 성능: 제곱근 및 곱셈 없음
 */
export const manhattanDistance = (
  p1: IEmotionCoordinate,
  p2: IEmotionCoordinate
): number => {
  return Math.abs(p1.valence - p2.valence) + Math.abs(p1.arousal - p2.arousal);
};

// ============================================================================
// Quadrant Calculations (비트 연산으로 최적화)
// ============================================================================

/**
 * 사분면 번호 반환 (1-4)
 * 성능: 비트 연산 활용
 */
export const getQuadrant = (valence: number, arousal: number): 1 | 2 | 3 | 4 => {
  const vBit = valence >= 0 ? 1 : 0;
  const aBit = arousal >= 0 ? 1 : 0;
  const index = (aBit << 1) | vBit;
  
  // 룩업 테이블
  const quadrants = [3, 4, 2, 1] as const;
  return quadrants[index];
};

/**
 * 점이 특정 사분면에 속하는지 확인
 * 성능: 비트 연산
 */
export const isInQuadrant = (
  point: IEmotionCoordinate,
  quadrant: 1 | 2 | 3 | 4
): boolean => {
  return getQuadrant(point.valence, point.arousal) === quadrant;
};

// ============================================================================
// Viewport Calculations
// ============================================================================

/**
 * 점이 뷰포트 내에 있는지 확인
 * 성능: 단일 조건문으로 최적화
 */
export const isPointInViewport = (
  point: IEmotionCoordinate,
  viewport: IViewport
): boolean => {
  return (
    point.valence >= viewport.x &&
    point.valence <= viewport.x + viewport.width &&
    point.arousal >= viewport.y &&
    point.arousal <= viewport.y + viewport.height
  );
};

/**
 * 뷰포트 경계 박스 계산
 */
export const getViewportBounds = (viewport: IViewport) => {
  return {
    minX: viewport.x,
    maxX: viewport.x + viewport.width,
    minY: viewport.y,
    maxY: viewport.y + viewport.height,
  };
};

// ============================================================================
// Normalization (순수 함수)
// ============================================================================

/**
 * 값을 범위 내로 클램프
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * 값을 [-1, 1] 범위로 정규화
 */
export const normalizeToRange = (
  value: number,
  min: number,
  max: number
): number => {
  return ((value - min) / (max - min)) * 2 - 1;
};

/**
 * 좌표 정규화 (안전한 범위 보장)
 */
export const normalizeCoordinate = (
  coord: IEmotionCoordinate
): IEmotionCoordinate => {
  return {
    valence: clamp(coord.valence, COORDINATE_SYSTEM.MIN_VALENCE, COORDINATE_SYSTEM.MAX_VALENCE),
    arousal: clamp(coord.arousal, COORDINATE_SYSTEM.MIN_AROUSAL, COORDINATE_SYSTEM.MAX_AROUSAL),
  };
};

// ============================================================================
// Angle Calculations
// ============================================================================

/**
 * 두 점 사이의 각도 계산 (라디안)
 */
export const angleBetween = (
  p1: IEmotionCoordinate,
  p2: IEmotionCoordinate
): number => {
  return Math.atan2(p2.arousal - p1.arousal, p2.valence - p1.valence);
};

/**
 * 라디안을 도(degree)로 변환
 */
export const radiansToDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};

/**
 * 도를 라디안으로 변환
 */
export const degreesToRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// ============================================================================
// Nearest Neighbor (K-NN)
// ============================================================================

/**
 * K-최근접 이웃 찾기
 * 성능: 힙 자료구조로 최적화 가능
 */
export const findKNearestNeighbors = <T extends IEmotionCoordinate>(
  target: IEmotionCoordinate,
  points: T[],
  k: number
): T[] => {
  // 거리 계산 (제곱 거리 사용으로 성능 향상)
  const withDistances = points.map(point => ({
    point,
    distance: squaredDistance(target, point),
  }));

  // 정렬 (부분 정렬로 최적화 가능)
  withDistances.sort((a, b) => a.distance - b.distance);

  // 상위 K개 반환
  return withDistances.slice(0, k).map(item => item.point);
};

// ============================================================================
// Bounding Box
// ============================================================================

/**
 * 점들의 경계 박스 계산
 */
export const calculateBoundingBox = (
  points: IEmotionCoordinate[]
): IViewport => {
  if (points.length === 0) {
    return { x: -1, y: -1, width: 2, height: 2 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  // 단일 패스로 최소/최대 계산
  for (const point of points) {
    if (point.valence < minX) minX = point.valence;
    if (point.valence > maxX) maxX = point.valence;
    if (point.arousal < minY) minY = point.arousal;
    if (point.arousal > maxY) maxY = point.arousal;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

// ============================================================================
// Collision Detection
// ============================================================================

/**
 * 두 원이 충돌하는지 확인
 */
export const circlesCollide = (
  center1: IEmotionCoordinate,
  radius1: number,
  center2: IEmotionCoordinate,
  radius2: number
): boolean => {
  const distanceSquared = squaredDistance(center1, center2);
  const radiusSum = radius1 + radius2;
  return distanceSquared <= radiusSum * radiusSum;
};

// ============================================================================
// Interpolation
// ============================================================================

/**
 * 선형 보간
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

/**
 * 좌표 보간
 */
export const lerpCoordinate = (
  start: IEmotionCoordinate,
  end: IEmotionCoordinate,
  t: number
): IEmotionCoordinate => {
  return {
    valence: lerp(start.valence, end.valence, t),
    arousal: lerp(start.arousal, end.arousal, t),
  };
};

