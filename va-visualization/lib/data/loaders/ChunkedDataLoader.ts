
import type { IEmotionData, IRawEmotionData } from '@/lib/types/emotion.types';
import type { IProgressiveDataLoader } from './IDataLoader';

interface IEmotionApiMetadata {
  totalCount: number;
  chunkSize: number;
  totalChunks: number;
}

export class ChunkedDataLoader implements IProgressiveDataLoader {
  private static readonly MAX_CONCURRENT_REQUESTS = 8;
  private metadata: IEmotionApiMetadata | null = null;

  private async getMetadata(): Promise<IEmotionApiMetadata> {
    if (this.metadata) {
      return this.metadata;
    }
    const response = await fetch('/api/emotions/metadata');
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    this.metadata = await response.json();
    return this.metadata!;
  }

  async loadData(): Promise<IEmotionData[]> {
    const allData: IEmotionData[] = [];
    await this.loadDataProgressively((_, chunk) => {
      allData.push(...chunk);
    });
    return allData;
  }

  async loadDataProgressively(onProgress: (progress: number, chunk: IEmotionData[]) => void): Promise<void> {
    console.log('[ChunkedDataLoader] Starting progressive data loading...');
    const metadata = await this.getMetadata();
    const { totalChunks, totalCount, chunkSize } = metadata;
    console.log(`[ChunkedDataLoader] Metadata - Total chunks: ${totalChunks}, Total count: ${totalCount}, Chunk size: ${chunkSize}`);
    
    let loadedChunks = 0;

    for (let i = 0; i < totalChunks; i += ChunkedDataLoader.MAX_CONCURRENT_REQUESTS) {
      const chunkPromises: Promise<IEmotionData[]>[] = [];

      for (let j = 0; j < ChunkedDataLoader.MAX_CONCURRENT_REQUESTS && i + j < totalChunks; j++) {
        const chunkId = i + j;
        console.log(`[ChunkedDataLoader] Loading chunk ${chunkId}...`);
        chunkPromises.push(this.loadChunk(chunkId));
      }

      const chunks = await Promise.all(chunkPromises);
      console.log(`[ChunkedDataLoader] Loaded ${chunks.length} chunks in this batch`);
      
      chunks.forEach((chunk) => {
        loadedChunks++;
        const progress = (loadedChunks / totalChunks) * 100;
        console.log(`[ChunkedDataLoader] Chunk ${loadedChunks}/${totalChunks} completed, Progress: ${progress.toFixed(1)}%`);
        console.log(`[ChunkedDataLoader] Calling onProgress with progress: ${progress}, chunk size: ${chunk.length}`);
        onProgress(progress, chunk);
        console.log(`[ChunkedDataLoader] onProgress called successfully`);
      });
    }
    console.log('[ChunkedDataLoader] Progressive data loading completed');
  }

  private async loadChunk(chunkId: number): Promise<IEmotionData[]> {
    console.log(`[ChunkedDataLoader] Fetching chunk ${chunkId}...`);
    const response = await fetch(`/api/emotions/chunk/${chunkId}?compress=true`);
    if (!response.ok) {
      console.error(`[ChunkedDataLoader] Failed to load chunk ${chunkId}: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to load chunk ${chunkId}`);
    }
    const rawData: IRawEmotionData[] = await response.json();
    console.log(`[ChunkedDataLoader] Chunk ${chunkId} loaded successfully - ${rawData.length} raw items`);
    const normalizedData = rawData.map((raw) => this.normalizeEmotionData(raw));
    console.log(`[ChunkedDataLoader] Chunk ${chunkId} normalized - ${normalizedData.length} items`);
    return normalizedData;
  }

  /**
   * 원시 데이터를 정규화된 IEmotionData로 변환
   */
  private normalizeEmotionData(raw: IRawEmotionData): IEmotionData {
    return {
      term: raw.term,
      valence: raw.valence,
      arousal: raw.arousal,
      dominance: raw.dominance,
      confidence: raw.confidence ?? 0.5, // 기본값 설정
      mergeStrategy: this.normalizeMergeStrategy(raw.merge_strategy),
      isMultiword: raw.is_multiword ?? false, // 기본값 설정
      metadata: {
        sourceWarriner: raw.source_warriner,
        sourceNRC: raw.source_nrc,
        rawData: raw,
      },
    };
  }

  /**
   * merge_strategy를 정규화된 형식으로 변환
   */
  private normalizeMergeStrategy(strategy?: string): 'both_weighted' | 'warriner_only' | 'nrc_only' | 'unknown' {
    switch (strategy) {
      case 'both_weighted':
        return 'both_weighted';
      case 'warriner_only':
        return 'warriner_only';
      case 'nrc_only':
        return 'nrc_only';
      default:
        return 'unknown';
    }
  }
}
