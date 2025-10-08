/**
 * Web Worker for Data Processing
 * 백그라운드에서 데이터 변환 및 처리 작업 수행
 */

// 메시지 타입 정의
const MESSAGE_TYPES = {
  TRANSFORM_DATA: 'TRANSFORM_DATA',
  FILTER_DATA: 'FILTER_DATA',
  SEARCH_DATA: 'SEARCH_DATA',
  CALCULATE_STATISTICS: 'CALCULATE_STATISTICS'
};

// 신뢰도에 따른 색상 결정 함수
function getConfidenceColor(confidence) {
  if (confidence >= 0.8) return '#10b981'; // 높은 신뢰도 - 녹색
  if (confidence >= 0.7) return '#f59e0b'; // 중간 신뢰도 - 주황색
  return '#ef4444'; // 낮은 신뢰도 - 빨간색
}

// 포인트 크기 상수
const POINT_SIZE = {
  DEFAULT: 2,
  MULTIWORD: 3
};

// 데이터 변환 함수
function transformEmotionData(emotions, canvasWidth, canvasHeight) {
  console.log(`[DataWorker] Transforming ${emotions.length} emotions`);
  
  const startTime = performance.now();
  
  const result = emotions.map(emotion => {
    // 신뢰도에 따른 색상 결정
    const color = getConfidenceColor(emotion.confidence);
    
    // 다중어 여부에 따른 크기 결정
    const size = emotion.isMultiword ? POINT_SIZE.MULTIWORD : POINT_SIZE.DEFAULT;
    
    return {
      term: emotion.term,
      x: emotion.valence, // V-A 좌표계 직접 사용
      y: emotion.arousal, // V-A 좌표계 직접 사용
      valence: emotion.valence,
      arousal: emotion.arousal,
      confidence: emotion.confidence,
      mergeStrategy: emotion.mergeStrategy,
      isMultiword: emotion.isMultiword,
      color,
      size,
    };
  });
  
  const endTime = performance.now();
  console.log(`[DataWorker] Transformation completed in ${(endTime - startTime).toFixed(2)}ms`);
  
  return result;
}

// 데이터 필터링 함수
function filterEmotionData(emotions, filters) {
  console.log(`[DataWorker] Filtering ${emotions.length} emotions with filters:`, filters);
  
  const startTime = performance.now();
  
  let filtered = emotions;
  
  // 검색어 필터
  if (filters.searchTerm && filters.searchTerm.trim()) {
    const lowerSearch = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(emotion => 
      emotion.term.toLowerCase().includes(lowerSearch)
    );
  }
  
  // 신뢰도 필터
  if (filters.minConfidence !== undefined) {
    filtered = filtered.filter(emotion => 
      emotion.confidence >= filters.minConfidence
    );
  }
  
  // Valence 범위 필터
  if (filters.valenceRange) {
    filtered = filtered.filter(emotion => 
      emotion.valence >= filters.valenceRange.min && 
      emotion.valence <= filters.valenceRange.max
    );
  }
  
  // Arousal 범위 필터
  if (filters.arousalRange) {
    filtered = filtered.filter(emotion => 
      emotion.arousal >= filters.arousalRange.min && 
      emotion.arousal <= filters.arousalRange.max
    );
  }
  
  const endTime = performance.now();
  console.log(`[DataWorker] Filtering completed in ${(endTime - startTime).toFixed(2)}ms, ${filtered.length} results`);
  
  return filtered;
}

// 통계 계산 함수
function calculateStatistics(emotions) {
  console.log(`[DataWorker] Calculating statistics for ${emotions.length} emotions`);
  
  const startTime = performance.now();
  
  if (emotions.length === 0) {
    return {
      totalCount: 0,
      valenceRange: { min: 0, max: 0 },
      arousalRange: { min: 0, max: 0 },
      confidenceRange: { min: 0, max: 0 },
      averageConfidence: 0
    };
  }
  
  const valenceValues = emotions.map(e => e.valence);
  const arousalValues = emotions.map(e => e.arousal);
  const confidenceValues = emotions.map(e => e.confidence);
  
  const statistics = {
    totalCount: emotions.length,
    valenceRange: {
      min: Math.min(...valenceValues),
      max: Math.max(...valenceValues)
    },
    arousalRange: {
      min: Math.min(...arousalValues),
      max: Math.max(...arousalValues)
    },
    confidenceRange: {
      min: Math.min(...confidenceValues),
      max: Math.max(...confidenceValues)
    },
    averageConfidence: confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length
  };
  
  const endTime = performance.now();
  console.log(`[DataWorker] Statistics calculation completed in ${(endTime - startTime).toFixed(2)}ms`);
  
  return statistics;
}

// 메시지 처리
self.addEventListener('message', (event) => {
  const { type, data, id } = event.data;
  
  try {
    let result;
    
    switch (type) {
      case MESSAGE_TYPES.TRANSFORM_DATA:
        result = transformEmotionData(data.emotions, data.canvasWidth, data.canvasHeight);
        break;
        
      case MESSAGE_TYPES.FILTER_DATA:
        result = filterEmotionData(data.emotions, data.filters);
        break;
        
      case MESSAGE_TYPES.SEARCH_DATA:
        result = filterEmotionData(data.emotions, { searchTerm: data.searchTerm });
        break;
        
      case MESSAGE_TYPES.CALCULATE_STATISTICS:
        result = calculateStatistics(data.emotions);
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
    
    // 결과 전송
    self.postMessage({
      type: 'SUCCESS',
      id,
      result
    });
    
  } catch (error) {
    console.error('[DataWorker] Error processing message:', error);
    
    // 에러 전송
    self.postMessage({
      type: 'ERROR',
      id,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
});

// Worker 초기화 완료 알림
try {
  self.postMessage({
    type: 'INITIALIZED',
    message: 'Data Worker initialized successfully'
  });
  console.log('[DataWorker] Web Worker started successfully');
} catch (error) {
  console.error('[DataWorker] Failed to send initialization message:', error);
}


