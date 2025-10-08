/**
 * @file geometry.util.ts
 * @description 기하학 계산 유틸리티 함수
 * @principle Pure Functions - 사이드 이펙트 없는 순수 함수
 */

import type { IPoint2D, IViewport } from '@/lib/types/visualization.types';

// ============================================================================
// Distance Calculations
// ============================================================================

/**
 * 두 점 사이의 유클리드 거리 계산
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * 두 Point2D 객체 사이의 거리 계산
 */
export function distancePoint2D(p1: IPoint2D, p2: IPoint2D): number {
  return distance(p1.x, p1.y, p2.x, p2.y);
}

/**
 * 맨해튼 거리 (Manhattan Distance) 계산
 */
export function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

// ============================================================================
// Point Operations
// ============================================================================

/**
 * 점이 사각형 영역 내에 있는지 확인
 */
export function isPointInRect(
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * 점이 원 내에 있는지 확인
 */
export function isPointInCircle(
  px: number,
  py: number,
  cx: number,
  cy: number,
  radius: number
): boolean {
  return distance(px, py, cx, cy) <= radius;
}

/**
 * 점이 뷰포트 내에 있는지 확인
 */
export function isPointInViewport(point: IPoint2D, viewport: IViewport): boolean {
  return isPointInRect(
    point.x,
    point.y,
    viewport.x,
    viewport.y,
    viewport.width,
    viewport.height
  );
}

// ============================================================================
// Angle Calculations
// ============================================================================

/**
 * 두 점 사이의 각도 계산 (라디안)
 */
export function angleBetweenPoints(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * 라디안을 도(degree)로 변환
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * 도(degree)를 라디안으로 변환
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// ============================================================================
// Vector Operations
// ============================================================================

/**
 * 벡터의 크기 계산
 */
export function vectorMagnitude(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

/**
 * 벡터 정규화 (단위 벡터로 변환)
 */
export function normalizeVector(x: number, y: number): IPoint2D {
  const magnitude = vectorMagnitude(x, y);
  if (magnitude === 0) return { x: 0, y: 0 };
  return {
    x: x / magnitude,
    y: y / magnitude,
  };
}

/**
 * 벡터 내적 (Dot Product)
 */
export function dotProduct(x1: number, y1: number, x2: number, y2: number): number {
  return x1 * x2 + y1 * y2;
}

/**
 * 벡터 회전
 */
export function rotateVector(x: number, y: number, angle: number): IPoint2D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}

// ============================================================================
// Coordinate Transformations
// ============================================================================

/**
 * 선형 보간 (Linear Interpolation)
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * 값을 범위 내로 클램프
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 값을 한 범위에서 다른 범위로 매핑
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}

/**
 * 값을 0-1 범위로 정규화
 */
export function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

// ============================================================================
// Bounding Box Calculations
// ============================================================================

/**
 * 점들의 바운딩 박스 계산
 */
export function getBoundingBox(points: IPoint2D[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  points.forEach((point) => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * 두 바운딩 박스가 겹치는지 확인
 */
export function doBoxesIntersect(
  box1: { x: number; y: number; width: number; height: number },
  box2: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    box1.x + box1.width < box2.x ||
    box2.x + box2.width < box1.x ||
    box1.y + box1.height < box2.y ||
    box2.y + box2.height < box1.y
  );
}

// ============================================================================
// Rounding and Precision
// ============================================================================

/**
 * 특정 소수점 자리수로 반올림
 */
export function roundToPrecision(value: number, precision: number): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * 숫자가 거의 같은지 비교 (부동소수점 오차 허용)
 */
export function almostEqual(a: number, b: number, epsilon: number = 0.0001): boolean {
  return Math.abs(a - b) < epsilon;
}

// ============================================================================
// Curve Calculations
// ============================================================================

/**
 * 베지어 곡선 상의 점 계산 (Quadratic Bezier)
 */
export function quadraticBezier(
  t: number,
  p0: IPoint2D,
  p1: IPoint2D,
  p2: IPoint2D
): IPoint2D {
  const oneMinusT = 1 - t;
  return {
    x: oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x,
    y: oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y,
  };
}

/**
 * 3차 베지어 곡선 상의 점 계산 (Cubic Bezier)
 */
export function cubicBezier(
  t: number,
  p0: IPoint2D,
  p1: IPoint2D,
  p2: IPoint2D,
  p3: IPoint2D
): IPoint2D {
  const oneMinusT = 1 - t;
  const oneMinusTSquared = oneMinusT * oneMinusT;
  const oneMinusTCubed = oneMinusTSquared * oneMinusT;
  const tSquared = t * t;
  const tCubed = tSquared * t;

  return {
    x:
      oneMinusTCubed * p0.x +
      3 * oneMinusTSquared * t * p1.x +
      3 * oneMinusT * tSquared * p2.x +
      tCubed * p3.x,
    y:
      oneMinusTCubed * p0.y +
      3 * oneMinusTSquared * t * p1.y +
      3 * oneMinusT * tSquared * p2.y +
      tCubed * p3.y,
  };
}

// ============================================================================
// Miscellaneous
// ============================================================================

/**
 * 중점 계산
 */
export function midpoint(x1: number, y1: number, x2: number, y2: number): IPoint2D {
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  };
}

/**
 * 여러 점의 중심점 (무게중심) 계산
 */
export function centroid(points: IPoint2D[]): IPoint2D {
  if (points.length === 0) return { x: 0, y: 0 };

  const sum = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
    }),
    { x: 0, y: 0 }
  );

  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
}

