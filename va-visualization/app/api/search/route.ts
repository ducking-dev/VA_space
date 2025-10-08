/**
 * @file app/api/search/route.ts
 * @description 감정 검색 API Route
 * @principle RESTful API - 검색 기능 제공
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { IApiResponse, ISearchResult } from '@/lib/types/api.types';
import type { IRawEmotionData } from '@/lib/types/emotion.types';
import { SEARCH_CONFIG } from '@/lib/constants/api.const';

/**
 * GET /api/search?q=query&limit=50
 * 감정 데이터 검색
 */
export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : SEARCH_CONFIG.MAX_RESULTS;

    // 검증
    if (!query || query.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      const errorResponse: IApiResponse = {
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: `Query must be at least ${SEARCH_CONFIG.MIN_QUERY_LENGTH} characters`,
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (query.length > SEARCH_CONFIG.MAX_QUERY_LENGTH) {
      const errorResponse: IApiResponse = {
        success: false,
        error: {
          code: 'QUERY_TOO_LONG',
          message: `Query must not exceed ${SEARCH_CONFIG.MAX_QUERY_LENGTH} characters`,
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 데이터 로드
    const dataPath = path.join(process.cwd(), 'public', 'data', 'merged_vad.json');
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const emotions: IRawEmotionData[] = JSON.parse(fileContents);

    // 검색 실행
    const startTime = Date.now();
    const queryLower = query.toLowerCase();
    
    const results = emotions
      .filter((emotion) => emotion.term.toLowerCase().includes(queryLower))
      .slice(0, Math.min(limit, SEARCH_CONFIG.MAX_RESULTS));

    const took = Date.now() - startTime;

    // 검색 결과 구성
    const searchResult: ISearchResult<IRawEmotionData> = {
      query,
      results,
      total: results.length,
      took,
    };

    const response: IApiResponse<ISearchResult<IRawEmotionData>> = {
      success: true,
      data: searchResult,
      meta: {
        timestamp: Date.now(),
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Search error:', error);

    const errorResponse: IApiResponse = {
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: 'Failed to perform search',
        details: error instanceof Error ? { message: error.message } : undefined,
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
