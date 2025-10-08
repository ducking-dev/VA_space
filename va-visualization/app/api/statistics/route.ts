/**
 * @file app/api/statistics/route.ts
 * @description 감정 데이터 통계 API Route
 * @principle RESTful API - 통계 정보 제공
 */

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { IApiResponse } from '@/lib/types/api.types';
import type { IStatistics } from '@/lib/types/visualization.types';
import type { IRawEmotionData } from '@/lib/types/emotion.types';
import { mean, standardDeviation, median } from '@/lib/utils/math/statistics.util';

/**
 * GET /api/statistics
 * 감정 데이터 통계 정보 반환
 */
export async function GET() {
  try {
    // 데이터 로드
    const dataPath = path.join(process.cwd(), 'public', 'data', 'merged_vad.json');
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const emotions: IRawEmotionData[] = JSON.parse(fileContents);

    // 통계 계산
    const valences = emotions.map(e => e.valence);
    const arousals = emotions.map(e => e.arousal);
    const confidences = emotions
      .map(e => e.confidence)
      .filter((c): c is number => c !== undefined);

    // 병합 전략별 카운트
    const strategyCounts: Record<string, number> = {};
    emotions.forEach((emotion) => {
      const strategy = emotion.merge_strategy || 'unknown';
      strategyCounts[strategy] = (strategyCounts[strategy] || 0) + 1;
    });

    // 다중어 표현 카운트
    const multiwordCount = emotions.filter((e) => e.is_multiword).length;

    // 통계 객체 생성
    const statistics: IStatistics = {
      totalCount: emotions.length,
      multiwordCount,
      unigramCount: emotions.length - multiwordCount,
      valenceStats: {
        mean: mean(valences),
        std: standardDeviation(valences),
        min: Math.min(...valences),
        max: Math.max(...valences),
        median: median(valences),
      },
      arousalStats: {
        mean: mean(arousals),
        std: standardDeviation(arousals),
        min: Math.min(...arousals),
        max: Math.max(...arousals),
        median: median(arousals),
      },
      confidenceStats: {
        mean: mean(confidences),
        std: standardDeviation(confidences),
        min: Math.min(...confidences),
        max: Math.max(...confidences),
        median: median(confidences),
      },
      strategyDistribution: strategyCounts,
      quadrantDistribution: calculateQuadrantDistribution(emotions),
    };

    const response: IApiResponse<IStatistics> = {
      success: true,
      data: statistics,
      meta: {
        timestamp: Date.now(),
        version: 'v1',
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Statistics calculation error:', error);

    const errorResponse: IApiResponse = {
      success: false,
      error: {
        code: 'STATISTICS_ERROR',
        message: 'Failed to calculate statistics',
        details: error instanceof Error ? { message: error.message } : undefined,
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 사분면별 분포 계산
 */
function calculateQuadrantDistribution(emotions: IRawEmotionData[]): Record<string, number> {
  const distribution: Record<string, number> = {
    Q1: 0, // V+, A+ (Joy)
    Q2: 0, // V-, A+ (Anger)
    Q3: 0, // V-, A- (Sadness)
    Q4: 0, // V+, A- (Calm)
  };

  emotions.forEach((emotion) => {
    const { valence, arousal } = emotion;

    if (valence >= 0 && arousal >= 0) {
      distribution.Q1++;
    } else if (valence < 0 && arousal >= 0) {
      distribution.Q2++;
    } else if (valence < 0 && arousal < 0) {
      distribution.Q3++;
    } else {
      distribution.Q4++;
    }
  });

  return distribution;
}
