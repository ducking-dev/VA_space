
import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

/**
 * GET /api/emotions/chunk/[id]
 * 지정된 ID의 데이터 청크를 반환
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chunkId = parseInt(params.id, 10);
    if (isNaN(chunkId)) {
      return NextResponse.json({ error: 'Invalid chunk ID' }, { status: 400 });
    }

    const dataPath = path.join(process.cwd(), 'public', 'data', 'chunks', `chunk_${chunkId}.json`);
    const fileContents = await fs.readFile(dataPath, 'utf8');
    
    const compress = request.nextUrl.searchParams.get('compress') === 'true';

    if (compress) {
      const compressed = await gzip(fileContents);
      return new NextResponse(compressed as any, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Encoding': 'gzip',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return new NextResponse(fileContents, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    // ENOENT is the error code for "File not found"
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Chunk not found' }, { status: 404 });
    }
    console.error(`Error loading chunk ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to load chunk' }, { status: 500 });
  }
}
