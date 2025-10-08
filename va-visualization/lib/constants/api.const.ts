/**
 * @file api.const.ts
 * @description API 관련 상수 정의
 * @principle Single Responsibility - API 설정 상수만 정의
 */

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * API 엔드포인트
 */
export const API_ENDPOINTS = {
  EMOTIONS: '/api/emotions',
  SEARCH: '/api/search',
  STATISTICS: '/api/statistics',
} as const;

/**
 * 기본 API URL
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// ============================================================================
// HTTP Configuration
// ============================================================================

/**
 * HTTP 타임아웃 (ms)
 */
export const HTTP_TIMEOUT = {
  DEFAULT: 30000,  // 30초
  LONG: 60000,     // 60초
  SHORT: 10000,    // 10초
} as const;

/**
 * HTTP 재시도 설정
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,  // ms
  MAX_DELAY: 10000,     // ms
  BACKOFF_MULTIPLIER: 2,
  RETRY_ON_TIMEOUT: true,
} as const;

/**
 * 재시도 가능한 HTTP 상태 코드
 */
export const RETRYABLE_STATUS_CODES = [
  408,  // Request Timeout
  429,  // Too Many Requests
  500,  // Internal Server Error
  502,  // Bad Gateway
  503,  // Service Unavailable
  504,  // Gateway Timeout
] as const;

// ============================================================================
// Cache Configuration
// ============================================================================

/**
 * 캐시 TTL (초)
 */
export const CACHE_TTL = {
  SHORT: 60,       // 1분
  MEDIUM: 300,     // 5분
  LONG: 1800,      // 30분
  VERY_LONG: 3600, // 1시간
  EMOTION_DATA: 3600,      // 감정 데이터: 1시간
  STATISTICS: 1800,        // 통계: 30분
  SEARCH_RESULTS: 300,     // 검색 결과: 5분
} as const;

/**
 * 캐시 키 접두사
 */
export const CACHE_KEY_PREFIX = {
  EMOTIONS: 'emotions',
  SEARCH: 'search',
  STATISTICS: 'stats',
} as const;

// ============================================================================
// Request Headers
// ============================================================================

/**
 * 기본 HTTP 헤더
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

/**
 * API 버전
 */
export const API_VERSION = 'v1';

// ============================================================================
// Pagination
// ============================================================================

/**
 * 페이지네이션 기본값
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 1000,
} as const;

// ============================================================================
// Rate Limiting
// ============================================================================

/**
 * Rate Limit 설정
 */
export const RATE_LIMIT = {
  MAX_REQUESTS: 100,
  WINDOW_MS: 60000,  // 1분
} as const;

// ============================================================================
// Search Configuration
// ============================================================================

/**
 * 검색 설정
 */
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 1,
  MAX_QUERY_LENGTH: 100,
  MAX_RESULTS: 50,
  DEBOUNCE_MS: 300,
} as const;

// ============================================================================
// Error Messages
// ============================================================================

/**
 * 에러 메시지
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
  TIMEOUT_ERROR: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  NOT_FOUND: '요청한 데이터를 찾을 수 없습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  BAD_REQUEST: '잘못된 요청입니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
} as const;

/**
 * HTTP 상태 코드별 에러 메시지 매핑
 */
export const STATUS_CODE_MESSAGES: Record<number, string> = {
  400: ERROR_MESSAGES.BAD_REQUEST,
  401: ERROR_MESSAGES.UNAUTHORIZED,
  403: ERROR_MESSAGES.FORBIDDEN,
  404: ERROR_MESSAGES.NOT_FOUND,
  408: ERROR_MESSAGES.TIMEOUT_ERROR,
  500: ERROR_MESSAGES.SERVER_ERROR,
  502: ERROR_MESSAGES.SERVER_ERROR,
  503: ERROR_MESSAGES.SERVER_ERROR,
  504: ERROR_MESSAGES.TIMEOUT_ERROR,
};

// ============================================================================
// WebSocket Configuration
// ============================================================================

/**
 * WebSocket 설정
 */
export const WS_CONFIG = {
  RECONNECT: true,
  RECONNECT_INTERVAL: 5000,  // ms
  MAX_RECONNECT_ATTEMPTS: 5,
  HEARTBEAT_INTERVAL: 30000,  // ms
} as const;

// ============================================================================
// Data Validation
// ============================================================================

/**
 * 데이터 검증 설정
 */
export const VALIDATION_CONFIG = {
  MAX_EMOTION_COUNT: 100000,
  MIN_VALENCE: -1.0,
  MAX_VALENCE: 1.0,
  MIN_AROUSAL: -1.0,
  MAX_AROUSAL: 1.0,
  MIN_CONFIDENCE: 0.0,
  MAX_CONFIDENCE: 1.0,
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * 전체 API URL 생성
 */
export function buildApiUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
}

/**
 * 캐시 키 생성
 */
export function buildCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return [prefix, ...parts].join(':');
}

/**
 * 재시도 가능한 에러인지 확인
 */
export function isRetryableError(statusCode?: number): boolean {
  if (!statusCode) return false;
  return RETRYABLE_STATUS_CODES.includes(statusCode as any);
}

/**
 * 재시도 딜레이 계산 (Exponential Backoff)
 */
export function calculateRetryDelay(attempt: number): number {
  const delay = RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.MAX_DELAY);
}

/**
 * HTTP 상태 코드에 따른 에러 메시지 반환
 */
export function getErrorMessage(statusCode?: number): string {
  if (!statusCode) return ERROR_MESSAGES.UNKNOWN_ERROR;
  return STATUS_CODE_MESSAGES[statusCode] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

// ============================================================================
// Type Exports
// ============================================================================

export type ApiEndpointKey = keyof typeof API_ENDPOINTS;
export type CacheKeyPrefixKey = keyof typeof CACHE_KEY_PREFIX;
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;


