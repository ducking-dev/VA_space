
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/emotions/metadata
 * 데이터셋의 메타정보 (총 개수, 청크 크기 등) 반환
 */
export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'metadata.json');
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const metadata = JSON.parse(fileContents);

    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load metadata' },
      { status: 500 }
    );
  }
}
