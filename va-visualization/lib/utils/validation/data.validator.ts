/**
 * @file data.validator.ts
 * @description 데이터 검증 유틸리티 함수
 * @principle Single Responsibility - 데이터 유효성 검증만 담당
 */

import type {
  IRawEmotionData,
  IEmotionData,
  IEmotionDataValidation,
} from '@/lib/types/emotion.types';
import { VALIDATION_CONFIG } from '@/lib/constants/api.const';
import { VA_COORDINATE_RANGE } from '@/lib/constants/visualization.const';

// ============================================================================
// Basic Type Validation
// ============================================================================

/**
 * 값이 null 또는 undefined인지 확인
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * 값이 존재하는지 확인 (null, undefined 아님)
 */
export function exists<T>(value: T | null | undefined): value is T {
  return !isNullOrUndefined(value);
}

/**
 * 문자열인지 확인
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * 숫자인지 확인
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * 불린인지 확인
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 배열인지 확인
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * 객체인지 확인
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// ============================================================================
// String Validation
// ============================================================================

/**
 * 빈 문자열인지 확인
 */
export function isEmpty(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * 비어있지 않은 문자열인지 확인
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && !isEmpty(value);
}

/**
 * 최소 길이 검증
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * 최대 길이 검증
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/**
 * 길이 범위 검증
 */
export function isLengthInRange(
  value: string,
  minLength: number,
  maxLength: number
): boolean {
  return hasMinLength(value, minLength) && hasMaxLength(value, maxLength);
}

// ============================================================================
// Number Validation
// ============================================================================

/**
 * 범위 내 숫자인지 확인
 */
export function isNumberInRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max;
}

/**
 * 양수인지 확인
 */
export function isPositiveNumber(value: number): boolean {
  return isNumber(value) && value > 0;
}

/**
 * 음수가 아닌 숫자인지 확인
 */
export function isNonNegativeNumber(value: number): boolean {
  return isNumber(value) && value >= 0;
}

/**
 * 정수인지 확인
 */
export function isIntegerNumber(value: number): boolean {
  return isNumber(value) && Number.isInteger(value);
}

// ============================================================================
// Array Validation
// ============================================================================

/**
 * 빈 배열이 아닌지 확인
 */
export function isNonEmptyArray<T>(value: T[]): boolean {
  return isArray(value) && value.length > 0;
}

/**
 * 배열의 모든 요소가 조건을 만족하는지 확인
 */
export function allItemsSatisfy<T>(
  array: T[],
  predicate: (item: T) => boolean
): boolean {
  return isArray(array) && array.every(predicate);
}

/**
 * 배열에 중복이 없는지 확인
 */
export function hasNoDuplicates<T>(array: T[]): boolean {
  return new Set(array).size === array.length;
}

// ============================================================================
// Emotion Data Validation
// ============================================================================

/**
 * Valence 값 유효성 검증
 */
export function isValidValence(value: number): boolean {
  return (
    isNumber(value) &&
    isNumberInRange(
      value,
      VA_COORDINATE_RANGE.VALENCE.MIN,
      VA_COORDINATE_RANGE.VALENCE.MAX
    )
  );
}

/**
 * Arousal 값 유효성 검증
 */
export function isValidArousal(value: number): boolean {
  return (
    isNumber(value) &&
    isNumberInRange(
      value,
      VA_COORDINATE_RANGE.AROUSAL.MIN,
      VA_COORDINATE_RANGE.AROUSAL.MAX
    )
  );
}

/**
 * Confidence 값 유효성 검증
 */
export function isValidConfidence(value: number): boolean {
  return (
    isNumber(value) &&
    isNumberInRange(
      value,
      VALIDATION_CONFIG.MIN_CONFIDENCE,
      VALIDATION_CONFIG.MAX_CONFIDENCE
    )
  );
}

/**
 * Merge Strategy 유효성 검증
 */
export function isValidMergeStrategy(value: string): boolean {
  const validStrategies = [
    'both_weighted',
    'warriner_only',
    'nrc_only',
    'unknown',
  ];
  return isString(value) && validStrategies.includes(value);
}

/**
 * 원시 감정 데이터 유효성 검증
 */
export function validateRawEmotionData(
  data: unknown
): IEmotionDataValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 타입 검증
  if (!isObject(data)) {
    errors.push('데이터가 객체가 아닙니다.');
    return { isValid: false, errors, warnings };
  }

  const d = data as Partial<IRawEmotionData>;

  // 필수 필드 검증
  if (!isNonEmptyString(d.term)) {
    errors.push('term 필드가 비어있거나 유효하지 않습니다.');
  }

  if (!isNumber(d.valence)) {
    errors.push('valence 필드가 숫자가 아닙니다.');
  } else if (!isValidValence(d.valence)) {
    errors.push(
      `valence 값이 범위(${VA_COORDINATE_RANGE.VALENCE.MIN}~${VA_COORDINATE_RANGE.VALENCE.MAX})를 벗어났습니다.`
    );
  }

  if (!isNumber(d.arousal)) {
    errors.push('arousal 필드가 숫자가 아닙니다.');
  } else if (!isValidArousal(d.arousal)) {
    errors.push(
      `arousal 값이 범위(${VA_COORDINATE_RANGE.AROUSAL.MIN}~${VA_COORDINATE_RANGE.AROUSAL.MAX})를 벗어났습니다.`
    );
  }

  // 선택 필드 검증
  if (exists(d.confidence) && !isValidConfidence(d.confidence)) {
    warnings.push('confidence 값이 유효하지 않습니다.');
  }

  if (exists(d.merge_strategy) && !isValidMergeStrategy(d.merge_strategy)) {
    warnings.push('merge_strategy 값이 유효하지 않습니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 정규화된 감정 데이터 유효성 검증
 */
export function validateEmotionData(data: unknown): IEmotionDataValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(data)) {
    errors.push('데이터가 객체가 아닙니다.');
    return { isValid: false, errors, warnings };
  }

  const d = data as Partial<IEmotionData>;

  // 필수 필드 검증
  if (!isNonEmptyString(d.term)) {
    errors.push('term 필드가 비어있거나 유효하지 않습니다.');
  }

  if (!isValidValence(d.valence!)) {
    errors.push('valence 값이 유효하지 않습니다.');
  }

  if (!isValidArousal(d.arousal!)) {
    errors.push('arousal 값이 유효하지 않습니다.');
  }

  if (!isValidConfidence(d.confidence!)) {
    errors.push('confidence 값이 유효하지 않습니다.');
  }

  if (!isBoolean(d.isMultiword)) {
    errors.push('isMultiword 필드가 불린이 아닙니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 감정 데이터 배열 유효성 검증
 */
export function validateEmotionDataArray(
  data: unknown
): IEmotionDataValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isArray(data)) {
    errors.push('데이터가 배열이 아닙니다.');
    return { isValid: false, errors, warnings };
  }

  if (!isNonEmptyArray(data)) {
    warnings.push('데이터 배열이 비어있습니다.');
  }

  if (data.length > VALIDATION_CONFIG.MAX_EMOTION_COUNT) {
    warnings.push(
      `데이터 개수(${data.length})가 최대 허용치(${VALIDATION_CONFIG.MAX_EMOTION_COUNT})를 초과했습니다.`
    );
  }

  // 각 항목 검증 (샘플링)
  const sampleSize = Math.min(100, data.length);
  const sampleIndices = Array.from(
    { length: sampleSize },
    (_, i) => Math.floor((i * data.length) / sampleSize)
  );

  let invalidCount = 0;
  sampleIndices.forEach((index) => {
    const validation = validateRawEmotionData(data[index]);
    if (!validation.isValid) {
      invalidCount++;
    }
  });

  if (invalidCount > 0) {
    errors.push(
      `샘플링한 ${sampleSize}개 중 ${invalidCount}개 항목이 유효하지 않습니다.`
    );
  }

  // 중복 term 검증
  const terms = data
    .filter((item): item is { term: string } =>
      isObject(item) && isString((item as any).term)
    )
    .map((item) => item.term);

  if (!hasNoDuplicates(terms)) {
    warnings.push('중복된 term이 존재합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Sanitization
// ============================================================================

/**
 * 문자열 정제 (공백 제거, 소문자 변환)
 */
export function sanitizeString(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * 숫자 범위로 클램프
 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Valence 값 클램프
 */
export function clampValence(value: number): number {
  return clampNumber(
    value,
    VA_COORDINATE_RANGE.VALENCE.MIN,
    VA_COORDINATE_RANGE.VALENCE.MAX
  );
}

/**
 * Arousal 값 클램프
 */
export function clampArousal(value: number): number {
  return clampNumber(
    value,
    VA_COORDINATE_RANGE.AROUSAL.MIN,
    VA_COORDINATE_RANGE.AROUSAL.MAX
  );
}

/**
 * Confidence 값 클램프
 */
export function clampConfidence(value: number): number {
  return clampNumber(
    value,
    VALIDATION_CONFIG.MIN_CONFIDENCE,
    VALIDATION_CONFIG.MAX_CONFIDENCE
  );
}

// ============================================================================
// Custom Validators
// ============================================================================

/**
 * 커스텀 검증 함수 타입
 */
export type Validator<T> = (value: T) => boolean;

/**
 * 여러 검증 함수를 조합
 */
export function combineValidators<T>(
  ...validators: Validator<T>[]
): Validator<T> {
  return (value: T) => validators.every((validator) => validator(value));
}

/**
 * 조건부 검증
 */
export function conditionalValidator<T>(
  condition: (value: T) => boolean,
  validator: Validator<T>
): Validator<T> {
  return (value: T) => !condition(value) || validator(value);
}

// ============================================================================
// Error Aggregation
// ============================================================================

/**
 * 검증 결과 병합
 */
export function mergeValidationResults(
  ...results: IEmotionDataValidation[]
): IEmotionDataValidation {
  const allErrors = results.flatMap((r) => r.errors);
  const allWarnings = results.flatMap((r) => r.warnings);

  return {
    isValid: allErrors.length === 0,
    errors: [...new Set(allErrors)], // 중복 제거
    warnings: [...new Set(allWarnings)], // 중복 제거
  };
}

