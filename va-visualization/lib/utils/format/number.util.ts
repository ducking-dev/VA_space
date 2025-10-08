/**
 * @file number.util.ts
 * @description 숫자 포맷팅 유틸리티 함수
 * @principle Pure Functions - 사이드 이펙트 없는 순수 함수
 */

// ============================================================================
// Number Formatting
// ============================================================================

/**
 * 숫자를 천 단위 구분 기호로 포맷
 */
export function formatNumber(value: number, locale: string = 'ko-KR'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * 소수점 자리수 지정하여 포맷
 */
export function formatDecimal(
  value: number,
  decimals: number = 2,
  locale: string = 'ko-KR'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * 백분율 포맷 (0.5 → "50%")
 */
export function formatPercent(
  value: number,
  decimals: number = 0,
  locale: string = 'ko-KR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * 통화 포맷
 */
export function formatCurrency(
  value: number,
  currency: string = 'KRW',
  locale: string = 'ko-KR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

// ============================================================================
// Compact Number Formatting
// ============================================================================

/**
 * 숫자를 축약 형식으로 변환 (1000 → "1K")
 */
export function formatCompact(value: number, decimals: number = 1): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(decimals)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(decimals)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(decimals)}K`;
  }
  
  return `${sign}${absValue.toFixed(decimals)}`;
}

/**
 * 바이트 크기를 읽기 쉬운 형식으로 변환
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}

// ============================================================================
// Range and Bounds
// ============================================================================

/**
 * 값이 범위 내에 있는지 확인
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * 값을 범위 내로 제한 (clamp)
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 값을 순환 범위로 래핑 (wrap)
 */
export function wrap(value: number, min: number, max: number): number {
  const range = max - min;
  if (range === 0) return min;
  
  let wrapped = value;
  while (wrapped < min) wrapped += range;
  while (wrapped >= max) wrapped -= range;
  
  return wrapped;
}

// ============================================================================
// Rounding
// ============================================================================

/**
 * 특정 자릿수로 반올림
 */
export function round(value: number, decimals: number = 0): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * 올림 (특정 자릿수)
 */
export function ceil(value: number, decimals: number = 0): number {
  const multiplier = Math.pow(10, decimals);
  return Math.ceil(value * multiplier) / multiplier;
}

/**
 * 내림 (특정 자릿수)
 */
export function floor(value: number, decimals: number = 0): number {
  const multiplier = Math.pow(10, decimals);
  return Math.floor(value * multiplier) / multiplier;
}

/**
 * 특정 배수로 반올림
 */
export function roundToMultiple(value: number, multiple: number): number {
  if (multiple === 0) return value;
  return Math.round(value / multiple) * multiple;
}

// ============================================================================
// Interpolation
// ============================================================================

/**
 * 선형 보간
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * 역선형 보간 (값에서 t 계산)
 */
export function inverseLerp(start: number, end: number, value: number): number {
  if (start === end) return 0;
  return (value - start) / (end - start);
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

// ============================================================================
// Comparison
// ============================================================================

/**
 * 부동소수점 안전 비교 (거의 같음)
 */
export function almostEqual(
  a: number,
  b: number,
  epsilon: number = Number.EPSILON
): boolean {
  return Math.abs(a - b) < epsilon;
}

/**
 * 0에 가까운지 확인
 */
export function isNearZero(value: number, epsilon: number = 1e-10): boolean {
  return Math.abs(value) < epsilon;
}

// ============================================================================
// Sign and Absolute
// ============================================================================

/**
 * 부호 반환 (-1, 0, 1)
 */
export function sign(value: number): -1 | 0 | 1 {
  if (value > 0) return 1;
  if (value < 0) return -1;
  return 0;
}

/**
 * 절대값
 */
export function abs(value: number): number {
  return Math.abs(value);
}

// ============================================================================
// Validation
// ============================================================================

/**
 * 유한한 숫자인지 확인
 */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * 정수인지 확인
 */
export function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

/**
 * 양수인지 확인
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * 음수인지 확인
 */
export function isNegative(value: number): boolean {
  return value < 0;
}

/**
 * 0인지 확인
 */
export function isZero(value: number, epsilon: number = 1e-10): boolean {
  return isNearZero(value, epsilon);
}

/**
 * 짝수인지 확인
 */
export function isEven(value: number): boolean {
  return isInteger(value) && value % 2 === 0;
}

/**
 * 홀수인지 확인
 */
export function isOdd(value: number): boolean {
  return isInteger(value) && value % 2 !== 0;
}

// ============================================================================
// Random
// ============================================================================

/**
 * 범위 내 랜덤 정수 생성
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 범위 내 랜덤 실수 생성
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * 정규분포 랜덤 값 생성 (Box-Muller 변환)
 */
export function randomGaussian(mean: number = 0, stdDev: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

// ============================================================================
// Special Numbers
// ============================================================================

/**
 * 안전한 나눗셈 (0으로 나누기 방지)
 */
export function safeDivide(
  numerator: number,
  denominator: number,
  fallback: number = 0
): number {
  return isZero(denominator) ? fallback : numerator / denominator;
}

/**
 * 평균 계산 (안전)
 */
export function average(...values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * 최솟값 (배열)
 */
export function min(...values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

/**
 * 최댓값 (배열)
 */
export function max(...values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

// ============================================================================
// Precision
// ============================================================================

/**
 * 유효 숫자로 반올림
 */
export function toPrecision(value: number, precision: number): number {
  return parseFloat(value.toPrecision(precision));
}

/**
 * 지수 표기법으로 변환
 */
export function toExponential(value: number, decimals: number = 2): string {
  return value.toExponential(decimals);
}

/**
 * 고정 소수점 표기법으로 변환
 */
export function toFixed(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

