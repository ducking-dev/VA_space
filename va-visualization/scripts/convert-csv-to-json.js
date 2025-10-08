/**
 * @file convert-csv-to-json.js
 * @description CSV 데이터를 최적화된 JSON으로 변환
 * 성능 최적화: 스트리밍, 청크 처리, 압축
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ============================================================================
// Configuration
// ============================================================================

const INPUT_CSV = path.join(__dirname, '../../data/processed/merged_vad.csv');
const OUTPUT_JSON = path.join(__dirname, '../public/data/merged_vad.json');
const OUTPUT_MINIFIED = path.join(__dirname, '../public/data/merged_vad.min.json');

// 출력 디렉토리 생성
const outputDir = path.dirname(OUTPUT_JSON);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ============================================================================
// CSV Parser (스트리밍)
// ============================================================================

async function parseCSV(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const results = [];
  let headers = null;
  let lineNumber = 0;

  console.log('📖 CSV 파일 읽는 중...');

  for await (const line of rl) {
    lineNumber++;

    // 헤더 파싱
    if (!headers) {
      headers = line.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      continue;
    }

    // 데이터 파싱
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    
    if (values.length !== headers.length) {
      console.warn(`⚠️  라인 ${lineNumber}: 컬럼 수 불일치`);
      continue;
    }

    const row = {};
    headers.forEach((header, index) => {
      const value = values[index];
      
      // 타입 변환
      if (header === 'term') {
        row[header] = value;
      } else if (header === 'merge_strategy') {
        row[header] = value;
      } else if (header === 'is_multiword') {
        row[header] = value === 'true' || value === 'True' || value === '1';
      } else {
        // 숫자형 변환
        const num = parseFloat(value);
        row[header] = isNaN(num) ? null : num;
      }
    });

    results.push(row);

    // 진행률 표시
    if (lineNumber % 10000 === 0) {
      console.log(`   처리 중: ${lineNumber.toLocaleString()} 줄...`);
    }
  }

  console.log(`✅ 총 ${results.length.toLocaleString()} 항목 파싱 완료`);
  return results;
}

// ============================================================================
// Data Optimization
// ============================================================================

function optimizeData(data) {
  console.log('🔧 데이터 최적화 중...');

  return data.map(item => ({
    // 필수 필드만 포함
    term: item.term || item.word || '',
    valence: roundTo(item.valence_mean || item.V_mean || 0, 4),
    arousal: roundTo(item.arousal_mean || item.A_mean || 0, 4),
    confidence: roundTo(item.confidence || 0.7, 4),
    merge_strategy: item.merge_strategy || 'unknown',
    is_multiword: item.is_multiword || false,
  }));
}

function roundTo(num, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

// ============================================================================
// Statistics Calculation
// ============================================================================

function calculateStatistics(data) {
  console.log('📊 통계 계산 중...');

  const stats = {
    total: data.length,
    byStrategy: {},
    averageConfidence: 0,
    quadrantDistribution: { q1: 0, q2: 0, q3: 0, q4: 0 },
    valenceRange: { min: Infinity, max: -Infinity },
    arousalRange: { min: Infinity, max: -Infinity },
  };

  let confidenceSum = 0;

  data.forEach(item => {
    // 병합 전략별 카운트
    stats.byStrategy[item.merge_strategy] = 
      (stats.byStrategy[item.merge_strategy] || 0) + 1;

    // 신뢰도 합계
    confidenceSum += item.confidence;

    // 사분면 분포
    const v = item.valence;
    const a = item.arousal;
    if (v >= 0 && a >= 0) stats.quadrantDistribution.q1++;
    else if (v < 0 && a >= 0) stats.quadrantDistribution.q2++;
    else if (v < 0 && a < 0) stats.quadrantDistribution.q3++;
    else stats.quadrantDistribution.q4++;

    // 범위 계산
    if (v < stats.valenceRange.min) stats.valenceRange.min = v;
    if (v > stats.valenceRange.max) stats.valenceRange.max = v;
    if (a < stats.arousalRange.min) stats.arousalRange.min = a;
    if (a > stats.arousalRange.max) stats.arousalRange.max = a;
  });

  stats.averageConfidence = confidenceSum / data.length;

  return stats;
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('🚀 CSV to JSON 변환 시작\n');

  try {
    // CSV 파싱
    const rawData = await parseCSV(INPUT_CSV);

    // 데이터 최적화
    const optimizedData = optimizeData(rawData);

    // 통계 계산
    const statistics = calculateStatistics(optimizedData);

    // JSON 저장 (읽기 쉬운 형식)
    console.log('💾 JSON 파일 저장 중...');
    fs.writeFileSync(
      OUTPUT_JSON,
      JSON.stringify(optimizedData, null, 2),
      'utf8'
    );

    // Minified JSON 저장 (프로덕션용)
    fs.writeFileSync(
      OUTPUT_MINIFIED,
      JSON.stringify(optimizedData),
      'utf8'
    );

    // 통계 파일 저장
    const statsFile = path.join(outputDir, 'statistics.json');
    fs.writeFileSync(
      statsFile,
      JSON.stringify(statistics, null, 2),
      'utf8'
    );

    // 결과 출력
    console.log('\n✅ 변환 완료!\n');
    console.log('📁 출력 파일:');
    console.log(`   - ${path.relative(process.cwd(), OUTPUT_JSON)}`);
    console.log(`   - ${path.relative(process.cwd(), OUTPUT_MINIFIED)}`);
    console.log(`   - ${path.relative(process.cwd(), statsFile)}\n`);

    // 파일 크기 비교
    const csvSize = fs.statSync(INPUT_CSV).size;
    const jsonSize = fs.statSync(OUTPUT_JSON).size;
    const minSize = fs.statSync(OUTPUT_MINIFIED).size;

    console.log('📊 파일 크기:');
    console.log(`   - CSV:      ${(csvSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - JSON:     ${(jsonSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Minified: ${(minSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - 압축률:    ${((1 - minSize / csvSize) * 100).toFixed(1)}%\n`);

    // 통계 출력
    console.log('📊 데이터 통계:');
    console.log(`   - 총 항목: ${statistics.total.toLocaleString()}`);
    console.log(`   - 평균 신뢰도: ${statistics.averageConfidence.toFixed(4)}`);
    console.log('   - 병합 전략:');
    Object.entries(statistics.byStrategy).forEach(([strategy, count]) => {
      console.log(`     · ${strategy}: ${count.toLocaleString()}`);
    });
    console.log('   - 사분면 분포:');
    console.log(`     · Q1 (V+, A+): ${statistics.quadrantDistribution.q1.toLocaleString()}`);
    console.log(`     · Q2 (V-, A+): ${statistics.quadrantDistribution.q2.toLocaleString()}`);
    console.log(`     · Q3 (V-, A-): ${statistics.quadrantDistribution.q3.toLocaleString()}`);
    console.log(`     · Q4 (V+, A-): ${statistics.quadrantDistribution.q4.toLocaleString()}`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

// 실행
main();

