/**
 * @file statistics.util.ts
 * @description 통계 계산 유틸리티 함수
 * @principle Pure Functions - 사이드 이펙트 없는 순수 함수
 */

// ============================================================================
// Basic Statistics
// ============================================================================

/**
 * 평균 계산
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * 중앙값 계산
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * 최빈값 계산
 */
export function mode(values: number[]): number | number[] {
  if (values.length === 0) return 0;
  
  const frequency = new Map<number, number>();
  values.forEach(val => {
    frequency.set(val, (frequency.get(val) || 0) + 1);
  });
  
  let maxFreq = 0;
  const modes: number[] = [];
  
  frequency.forEach((freq, val) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      modes.length = 0;
      modes.push(val);
    } else if (freq === maxFreq) {
      modes.push(val);
    }
  });
  
  return modes.length === 1 ? modes[0] : modes;
}

/**
 * 범위 (최대값 - 최소값)
 */
export function range(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
}

/**
 * 최소값
 */
export function min(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

/**
 * 최대값
 */
export function max(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

// ============================================================================
// Variance and Standard Deviation
// ============================================================================

/**
 * 분산 계산
 */
export function variance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const avg = mean(values);
  const squaredDiffs = values.map(val => (val - avg) ** 2);
  return mean(squaredDiffs);
}

/**
 * 표준편차 계산
 */
export function standardDeviation(values: number[]): number {
  return Math.sqrt(variance(values));
}

/**
 * 표본 분산 계산 (n-1로 나눔)
 */
export function sampleVariance(values: number[]): number {
  if (values.length <= 1) return 0;
  
  const avg = mean(values);
  const squaredDiffs = values.map(val => (val - avg) ** 2);
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / (values.length - 1);
}

/**
 * 표본 표준편차 계산
 */
export function sampleStandardDeviation(values: number[]): number {
  return Math.sqrt(sampleVariance(values));
}

// ============================================================================
// Quartiles and Percentiles
// ============================================================================

/**
 * 백분위수 계산
 */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  if (p < 0 || p > 100) throw new Error('Percentile must be between 0 and 100');
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * 사분위수 계산
 */
export function quartiles(values: number[]): {
  q1: number;
  q2: number;
  q3: number;
} {
  return {
    q1: percentile(values, 25),
    q2: percentile(values, 50), // median
    q3: percentile(values, 75),
  };
}

/**
 * 사분위수 범위 (IQR)
 */
export function iqr(values: number[]): number {
  const q = quartiles(values);
  return q.q3 - q.q1;
}

// ============================================================================
// Correlation and Covariance
// ============================================================================

/**
 * 공분산 계산
 */
export function covariance(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const meanX = mean(x);
  const meanY = mean(y);
  
  const sum = x.reduce((acc, xi, i) => {
    return acc + (xi - meanX) * (y[i] - meanY);
  }, 0);
  
  return sum / x.length;
}

/**
 * 피어슨 상관계수 계산
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const cov = covariance(x, y);
  const stdX = standardDeviation(x);
  const stdY = standardDeviation(y);
  
  if (stdX === 0 || stdY === 0) return 0;
  return cov / (stdX * stdY);
}

// ============================================================================
// Distribution Analysis
// ============================================================================

/**
 * Z-점수 계산 (표준화)
 */
export function zScore(value: number, values: number[]): number {
  const avg = mean(values);
  const std = standardDeviation(values);
  
  if (std === 0) return 0;
  return (value - avg) / std;
}

/**
 * 왜도 계산 (Skewness)
 */
export function skewness(values: number[]): number {
  if (values.length < 3) return 0;
  
  const avg = mean(values);
  const std = standardDeviation(values);
  
  if (std === 0) return 0;
  
  const n = values.length;
  const sum = values.reduce((acc, val) => {
    return acc + Math.pow((val - avg) / std, 3);
  }, 0);
  
  return (n / ((n - 1) * (n - 2))) * sum;
}

/**
 * 첨도 계산 (Kurtosis)
 */
export function kurtosis(values: number[]): number {
  if (values.length < 4) return 0;
  
  const avg = mean(values);
  const std = standardDeviation(values);
  
  if (std === 0) return 0;
  
  const n = values.length;
  const sum = values.reduce((acc, val) => {
    return acc + Math.pow((val - avg) / std, 4);
  }, 0);
  
  return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum -
         (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
}

// ============================================================================
// Binning and Histograms
// ============================================================================

/**
 * 히스토그램 빈 생성
 */
export function histogram(
  values: number[],
  bins: number = 10
): { bin: number; count: number; range: [number, number] }[] {
  if (values.length === 0) return [];
  
  const minVal = min(values);
  const maxVal = max(values);
  const binWidth = (maxVal - minVal) / bins;
  
  const histogram: { bin: number; count: number; range: [number, number] }[] = [];
  
  for (let i = 0; i < bins; i++) {
    const start = minVal + i * binWidth;
    const end = start + binWidth;
    const count = values.filter(val => 
      val >= start && (i === bins - 1 ? val <= end : val < end)
    ).length;
    
    histogram.push({
      bin: i,
      count,
      range: [start, end],
    });
  }
  
  return histogram;
}

// ============================================================================
// Summary Statistics
// ============================================================================

/**
 * 요약 통계량 계산
 */
export function summary(values: number[]): {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  range: number;
  variance: number;
  stdDev: number;
  q1: number;
  q3: number;
  iqr: number;
} {
  const q = quartiles(values);
  
  return {
    count: values.length,
    mean: mean(values),
    median: median(values),
    min: min(values),
    max: max(values),
    range: range(values),
    variance: variance(values),
    stdDev: standardDeviation(values),
    q1: q.q1,
    q3: q.q3,
    iqr: q.q3 - q.q1,
  };
}

// ============================================================================
// Normalization
// ============================================================================

/**
 * Min-Max 정규화 (0-1 범위로)
 */
export function minMaxNormalize(values: number[]): number[] {
  const minVal = min(values);
  const maxVal = max(values);
  const range = maxVal - minVal;
  
  if (range === 0) return values.map(() => 0.5);
  return values.map(val => (val - minVal) / range);
}

/**
 * Z-점수 정규화 (표준화)
 */
export function zScoreNormalize(values: number[]): number[] {
  const avg = mean(values);
  const std = standardDeviation(values);
  
  if (std === 0) return values.map(() => 0);
  return values.map(val => (val - avg) / std);
}

// ============================================================================
// Outlier Detection
// ============================================================================

/**
 * IQR 방법으로 이상치 탐지
 */
export function detectOutliers(values: number[]): {
  outliers: number[];
  indices: number[];
  lowerBound: number;
  upperBound: number;
} {
  const q = quartiles(values);
  const iqrValue = q.q3 - q.q1;
  const lowerBound = q.q1 - 1.5 * iqrValue;
  const upperBound = q.q3 + 1.5 * iqrValue;
  
  const outliers: number[] = [];
  const indices: number[] = [];
  
  values.forEach((val, index) => {
    if (val < lowerBound || val > upperBound) {
      outliers.push(val);
      indices.push(index);
    }
  });
  
  return { outliers, indices, lowerBound, upperBound };
}

// ============================================================================
// Moving Averages
// ============================================================================

/**
 * 단순 이동 평균 (Simple Moving Average)
 */
export function simpleMovingAverage(values: number[], window: number): number[] {
  if (window <= 0 || window > values.length) return values;
  
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const windowValues = values.slice(start, i + 1);
    result.push(mean(windowValues));
  }
  
  return result;
}

/**
 * 지수 이동 평균 (Exponential Moving Average)
 */
export function exponentialMovingAverage(values: number[], alpha: number = 0.5): number[] {
  if (values.length === 0) return [];
  
  const result: number[] = [values[0]];
  
  for (let i = 1; i < values.length; i++) {
    result.push(alpha * values[i] + (1 - alpha) * result[i - 1]);
  }
  
  return result;
}

