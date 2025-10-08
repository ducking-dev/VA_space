/**
 * @file CoordinateSystem.ts
 * @description V-A 좌표계 변환 시스템
 * @principle Single Responsibility - 좌표 변환만 담당
 */

import type { IPoint2D, IVACoordinate, IScreenCoordinate, ICoordinateTransform } from '@/lib/types/visualization.types';
import { VA_COORDINATE_RANGE, CANVAS_PADDING } from '@/lib/constants/visualization.const';
import { clamp } from '@/lib/utils/math/geometry.util';

/**
 * V-A 좌표계 관리 클래스
 */
export class CoordinateSystem {
  private transform: ICoordinateTransform;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.transform = this.calculateTransform(canvasWidth, canvasHeight);
  }

  /**
   * 좌표 변환 매트릭스 계산
   */
  private calculateTransform(width: number, height: number): ICoordinateTransform {
    const effectiveWidth = width - CANVAS_PADDING.LEFT - CANVAS_PADDING.RIGHT;
    const effectiveHeight = height - CANVAS_PADDING.TOP - CANVAS_PADDING.BOTTOM;

    const scaleX =
      effectiveWidth /
      (VA_COORDINATE_RANGE.VALENCE.MAX - VA_COORDINATE_RANGE.VALENCE.MIN);
    const scaleY =
      effectiveHeight /
      (VA_COORDINATE_RANGE.AROUSAL.MAX - VA_COORDINATE_RANGE.AROUSAL.MIN);

    // 동일한 스케일 사용 (왜곡 방지)
    const scale = Math.min(scaleX, scaleY);

    return {
      scale,
      offsetX: CANVAS_PADDING.LEFT,
      offsetY: CANVAS_PADDING.TOP,
      width,
      height,
    };
  }

  /**
   * V-A 좌표 → 화면 좌표 변환
   */
  public vaToScreen(valence: number, arousal: number): IScreenCoordinate {
    const { scale, offsetX, offsetY, width, height } = this.transform;

    const effectiveWidth = width - CANVAS_PADDING.LEFT - CANVAS_PADDING.RIGHT;
    const effectiveHeight = height - CANVAS_PADDING.TOP - CANVAS_PADDING.BOTTOM;

    // Valence: -1 ~ 1 → 0 ~ effectiveWidth
    const normalizedX = (valence - VA_COORDINATE_RANGE.VALENCE.MIN) / 2;
    const x = offsetX + normalizedX * effectiveWidth;

    // Arousal: -1 ~ 1 → effectiveHeight ~ 0 (Y축 반전)
    const normalizedY = (arousal - VA_COORDINATE_RANGE.AROUSAL.MIN) / 2;
    const y = offsetY + effectiveHeight - normalizedY * effectiveHeight;

    return { x, y };
  }

  /**
   * 화면 좌표 → V-A 좌표 변환
   */
  public screenToVA(x: number, y: number): IVACoordinate {
    const { offsetX, offsetY, width, height } = this.transform;

    const effectiveWidth = width - CANVAS_PADDING.LEFT - CANVAS_PADDING.RIGHT;
    const effectiveHeight = height - CANVAS_PADDING.TOP - CANVAS_PADDING.BOTTOM;

    // X: 화면 좌표 → -1 ~ 1
    const normalizedX = (x - offsetX) / effectiveWidth;
    const valence = clamp(
      VA_COORDINATE_RANGE.VALENCE.MIN + normalizedX * 2,
      VA_COORDINATE_RANGE.VALENCE.MIN,
      VA_COORDINATE_RANGE.VALENCE.MAX
    );

    // Y: 화면 좌표 → -1 ~ 1 (Y축 반전)
    const normalizedY = (effectiveHeight - (y - offsetY)) / effectiveHeight;
    const arousal = clamp(
      VA_COORDINATE_RANGE.AROUSAL.MIN + normalizedY * 2,
      VA_COORDINATE_RANGE.AROUSAL.MIN,
      VA_COORDINATE_RANGE.AROUSAL.MAX
    );

    return { valence, arousal };
  }

  /**
   * 여러 V-A 좌표를 화면 좌표로 일괄 변환
   */
  public batchVAToScreen(points: IVACoordinate[]): IScreenCoordinate[] {
    return points.map((point) => this.vaToScreen(point.valence, point.arousal));
  }

  /**
   * 여러 화면 좌표를 V-A 좌표로 일괄 변환
   */
  public batchScreenToVA(points: IScreenCoordinate[]): IVACoordinate[] {
    return points.map((point) => this.screenToVA(point.x, point.y));
  }

  /**
   * 캔버스 크기 변경 시 변환 매트릭스 업데이트
   */
  public resize(width: number, height: number): void {
    this.transform = this.calculateTransform(width, height);
  }

  /**
   * 현재 변환 설정 반환
   */
  public getTransform(): Readonly<ICoordinateTransform> {
    return Object.freeze({ ...this.transform });
  }

  /**
   * 화면 좌표가 V-A 평면 내에 있는지 확인
   */
  public isScreenCoordinateValid(x: number, y: number): boolean {
    const { offsetX, offsetY, width, height } = this.transform;

    const maxX = width - CANVAS_PADDING.RIGHT;
    const maxY = height - CANVAS_PADDING.BOTTOM;

    return x >= offsetX && x <= maxX && y >= offsetY && y <= maxY;
  }

  /**
   * V-A 좌표가 유효한 범위 내에 있는지 확인
   */
  public isVACoordinateValid(valence: number, arousal: number): boolean {
    return (
      valence >= VA_COORDINATE_RANGE.VALENCE.MIN &&
      valence <= VA_COORDINATE_RANGE.VALENCE.MAX &&
      arousal >= VA_COORDINATE_RANGE.AROUSAL.MIN &&
      arousal <= VA_COORDINATE_RANGE.AROUSAL.MAX
    );
  }

  /**
   * 캔버스의 유효 렌더링 영역 반환
   */
  public getValidRenderingArea(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const { width, height } = this.transform;
    return {
      x: CANVAS_PADDING.LEFT,
      y: CANVAS_PADDING.TOP,
      width: width - CANVAS_PADDING.LEFT - CANVAS_PADDING.RIGHT,
      height: height - CANVAS_PADDING.TOP - CANVAS_PADDING.BOTTOM,
    };
  }

  /**
   * V-A 평면의 중심점 화면 좌표 반환
   */
  public getCenterScreen(): IScreenCoordinate {
    return this.vaToScreen(0, 0);
  }

  /**
   * 거리 변환 (V-A 공간 거리 → 화면 픽셀 거리)
   */
  public vaDistanceToScreen(vaDistance: number): number {
    return vaDistance * this.transform.scale;
  }

  /**
   * 거리 변환 (화면 픽셀 거리 → V-A 공간 거리)
   */
  public screenDistanceToVA(screenDistance: number): number {
    return screenDistance / this.transform.scale;
  }
}

/**
 * CoordinateSystem 싱글톤 팩토리 (옵션)
 */
export class CoordinateSystemFactory {
  private static instance: CoordinateSystem | null = null;

  static create(width: number, height: number): CoordinateSystem {
    if (!this.instance) {
      this.instance = new CoordinateSystem(width, height);
    } else {
      this.instance.resize(width, height);
    }
    return this.instance;
  }

  static getInstance(): CoordinateSystem | null {
    return this.instance;
  }

  static reset(): void {
    this.instance = null;
  }
}

