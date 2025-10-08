/**
 * @file api.types.ts
 * @description API 관련 TypeScript 타입 정의
 * @principle Single Responsibility - API 통신 관련 타입만 정의
 */

import type { IEmotionData, IRawEmotionData, IEmotionStatistics } from './emotion.types';

// ============================================================================
// HTTP Types
// ============================================================================

/**
 * HTTP 메서드
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * HTTP 상태 코드
 */
export type HttpStatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500 | 503;

/**
 * HTTP 헤더
 */
export type HttpHeaders = Record<string, string>;

// ============================================================================
// API Response Types
// ============================================================================

/**
 * 기본 API 응답
 */
export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: IApiError;
  meta?: IResponseMeta;
}

/**
 * API 에러
 */
export interface IApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

/**
 * 응답 메타데이터
 */
export interface IResponseMeta {
  timestamp: number;
  requestId?: string;
  version?: string;
}

// ============================================================================
// Pagination Types
// ============================================================================

/**
 * 페이지네이션 옵션
 */
export interface IPaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 페이지네이션 응답
 */
export interface IPaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// Emotion API Types
// ============================================================================

/**
 * 감정 데이터 API 응답
 */
export type IEmotionDataResponse = IApiResponse<IRawEmotionData[]>;

/**
 * 단일 감정 데이터 API 응답
 */
export type ISingleEmotionResponse = IApiResponse<IRawEmotionData>;

/**
 * 감정 통계 API 응답
 */
export type IEmotionStatisticsResponse = IApiResponse<IEmotionStatistics>;

// ============================================================================
// Search API Types
// ============================================================================

/**
 * 검색 쿼리 파라미터
 */
export interface ISearchQueryParams {
  q: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, unknown>;
}

/**
 * 검색 결과
 */
export interface ISearchResult<T> {
  query: string;
  results: T[];
  total: number;
  took: number;  // ms
}

/**
 * 감정 검색 응답
 */
export type IEmotionSearchResponse = IApiResponse<ISearchResult<IEmotionData>>;

// ============================================================================
// Request Configuration Types
// ============================================================================

/**
 * API 요청 설정
 */
export interface IRequestConfig {
  method?: HttpMethod;
  headers?: HttpHeaders;
  body?: unknown;
  timeout?: number;  // ms
  retry?: IRetryConfig;
  cache?: ICacheConfig;
}

/**
 * 재시도 설정
 */
export interface IRetryConfig {
  enabled: boolean;
  maxAttempts: number;
  delay: number;  // ms
  backoff?: 'linear' | 'exponential';
}

/**
 * 캐시 설정
 */
export interface ICacheConfig {
  enabled: boolean;
  ttl: number;  // seconds
  key?: string;
}

// ============================================================================
// API Client Types
// ============================================================================

/**
 * API 엔드포인트
 */
export enum ApiEndpoint {
  EMOTIONS = '/api/emotions',
  SEARCH = '/api/search',
  STATISTICS = '/api/statistics',
}

/**
 * API 클라이언트 설정
 */
export interface IApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: HttpHeaders;
  retry?: IRetryConfig;
  cache?: ICacheConfig;
}

/**
 * API 요청 옵션
 */
export interface IApiRequestOptions extends Omit<IRequestConfig, 'method'> {
  endpoint: ApiEndpoint | string;
  params?: Record<string, string | number | boolean>;
}

// ============================================================================
// Fetch Types
// ============================================================================

/**
 * Fetch 상태
 */
export type FetchState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Fetch 결과
 */
export interface IFetchResult<T> {
  state: FetchState;
  data?: T;
  error?: Error;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Mutation 상태
 */
export interface IMutationState<T = unknown> {
  state: FetchState;
  data?: T;
  error?: Error;
  isLoading: boolean;
}

// ============================================================================
// WebSocket Types
// ============================================================================

/**
 * WebSocket 메시지 타입
 */
export type WsMessageType = 'data' | 'update' | 'delete' | 'subscribe' | 'unsubscribe' | 'ping' | 'pong';

/**
 * WebSocket 메시지
 */
export interface IWsMessage<T = unknown> {
  type: WsMessageType;
  payload?: T;
  timestamp: number;
  id?: string;
}

/**
 * WebSocket 연결 상태
 */
export type WsConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

/**
 * WebSocket 설정
 */
export interface IWsConfig {
  url: string;
  protocols?: string[];
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * IApiResponse 타입 가드
 */
export function isApiResponse<T>(value: unknown): value is IApiResponse<T> {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.success === 'boolean';
}

/**
 * IApiError 타입 가드
 */
export function isApiError(value: unknown): value is IApiError {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.code === 'string' && typeof v.message === 'string';
}

/**
 * ISearchResult 타입 가드
 */
export function isSearchResult<T>(value: unknown): value is ISearchResult<T> {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.query === 'string' &&
    Array.isArray(v.results) &&
    typeof v.total === 'number'
  );
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * API 응답 추출 타입
 */
export type ExtractApiData<T> = T extends IApiResponse<infer U> ? U : never;

/**
 * 에러 핸들러 타입
 */
export type ErrorHandler = (error: IApiError) => void;

/**
 * 성공 핸들러 타입
 */
export type SuccessHandler<T> = (data: T) => void;


