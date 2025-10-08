/**
 * @file EmotionApiClient.ts
 * @description 감정 데이터 API 클라이언트
 * @principle Single Responsibility - API 통신만 담당
 */

import type {
  IApiResponse,
  IApiRequestOptions,
  IRequestConfig,
  IEmotionDataResponse,
  IEmotionSearchResponse,
  IEmotionStatisticsResponse,
} from '@/lib/types/api.types';
import type { IRawEmotionData, IEmotionStatistics } from '@/lib/types/emotion.types';
import {
  API_ENDPOINTS,
  API_BASE_URL,
  HTTP_TIMEOUT,
  RETRY_CONFIG,
  DEFAULT_HEADERS,
  buildApiUrl,
  isRetryableError,
  calculateRetryDelay,
  getErrorMessage,
} from '@/lib/constants/api.const';

/**
 * API 클라이언트 클래스
 */
export class EmotionApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string = API_BASE_URL, timeout: number = HTTP_TIMEOUT.DEFAULT) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
    this.defaultHeaders = DEFAULT_HEADERS;
  }

  /**
   * 모든 감정 데이터 조회
   */
  async getAllEmotions(): Promise<IRawEmotionData[]> {
    const response = await this.request<IRawEmotionData[]>({
      endpoint: API_ENDPOINTS.EMOTIONS,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch emotions');
    }

    return response.data;
  }

  /**
   * 감정 검색
   */
  async searchEmotions(query: string, limit: number = 50): Promise<IRawEmotionData[]> {
    const response = await this.request<{ results: IRawEmotionData[] }>({
      endpoint: API_ENDPOINTS.SEARCH,
      params: { q: query, limit },
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to search emotions');
    }

    return response.data.results || [];
  }

  /**
   * 통계 데이터 조회
   */
  async getStatistics(): Promise<IEmotionStatistics> {
    const response = await this.request<IEmotionStatistics>({
      endpoint: API_ENDPOINTS.STATISTICS,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch statistics');
    }

    return response.data;
  }

  /**
   * HTTP 요청 실행 (재시도 로직 포함)
   */
  private async request<T>(options: IApiRequestOptions): Promise<IApiResponse<T>> {
    const { endpoint, params, ...config } = options;
    const url = buildApiUrl(endpoint, params);

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < RETRY_CONFIG.MAX_ATTEMPTS) {
      try {
        const response = await this.executeRequest<T>(url, config);
        return response;
      } catch (error) {
        lastError = error as Error;
        attempt++;

        // 재시도 가능한 에러인지 확인
        const statusCode = (error as any).statusCode;
        if (!isRetryableError(statusCode) || attempt >= RETRY_CONFIG.MAX_ATTEMPTS) {
          break;
        }

        // 재시도 전 대기
        const delay = calculateRetryDelay(attempt);
        await this.sleep(delay);
      }
    }

    // 모든 재시도 실패
    return {
      success: false,
      error: {
        code: 'REQUEST_FAILED',
        message: lastError?.message || 'Request failed after retries',
      },
    };
  }

  /**
   * 실제 HTTP 요청 실행
   */
  private async executeRequest<T>(
    url: string,
    config: Partial<IRequestConfig> = {}
  ): Promise<IApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config.timeout || this.defaultTimeout
    );

    try {
      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: {
          ...this.defaultHeaders,
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // HTTP 상태 코드 확인
      if (!response.ok) {
        const errorMessage = getErrorMessage(response.status);
        throw {
          statusCode: response.status,
          message: errorMessage,
        };
      }

      // JSON 파싱
      const data = await response.json();

      return {
        success: true,
        data: data as T,
        meta: {
          timestamp: Date.now(),
        },
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Timeout 에러
      if (error.name === 'AbortError') {
        throw {
          statusCode: 408,
          message: 'Request timeout',
        };
      }

      // 네트워크 에러
      if (error instanceof TypeError) {
        throw {
          statusCode: 0,
          message: 'Network error',
        };
      }

      // 기타 에러
      throw error;
    }
  }

  /**
   * 비동기 대기
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Base URL 변경
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  /**
   * 기본 타임아웃 변경
   */
  setTimeout(timeout: number): void {
    this.defaultTimeout = timeout;
  }

  /**
   * 기본 헤더 설정
   */
  setHeaders(headers: HeadersInit): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}

/**
 * API 클라이언트 싱글톤 인스턴스
 */
let apiClientInstance: EmotionApiClient | null = null;

/**
 * API 클라이언트 인스턴스 반환
 */
export function getApiClient(): EmotionApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new EmotionApiClient();
  }
  return apiClientInstance;
}

/**
 * API 클라이언트 인스턴스 초기화
 */
export function resetApiClient(): void {
  apiClientInstance = null;
}

/**
 * 편의 함수들
 */

/**
 * 모든 감정 데이터 조회 (편의 함수)
 */
export async function fetchAllEmotions(): Promise<IRawEmotionData[]> {
  const client = getApiClient();
  return client.getAllEmotions();
}

/**
 * 감정 검색 (편의 함수)
 */
export async function searchEmotions(query: string, limit?: number): Promise<IRawEmotionData[]> {
  const client = getApiClient();
  return client.searchEmotions(query, limit);
}

/**
 * 통계 데이터 조회 (편의 함수)
 */
export async function fetchStatistics(): Promise<IEmotionStatistics> {
  const client = getApiClient();
  return client.getStatistics();
}


