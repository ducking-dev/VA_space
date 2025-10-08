#!/usr/bin/env python3
"""
CSV를 최적화된 JSON으로 변환 (multiprocessing + tqdm 최적화)
"""
import pandas as pd
import json
import os
from pathlib import Path
from multiprocessing import Pool, cpu_count
from tqdm import tqdm
import functools

def process_row(row):
    """단일 행을 처리하는 함수"""
    return {
        'term': row.get('term', row.get('word', '')),
        'valence': round(float(row.get('valence_mean', row.get('V_mean', 0))), 4),
        'arousal': round(float(row.get('arousal_mean', row.get('A_mean', 0))), 4),
        'confidence': round(float(row.get('confidence', 0.7)), 4),
        'merge_strategy': row.get('merge_strategy', 'unknown'),
    }

def main():
    print("🚀 CSV to JSON 변환 시작 (multiprocessing + tqdm 최적화)\n")
    
    # 경로 설정
    input_csv = Path("data/processed/merged_vad.csv")
    output_json = Path("va-visualization/public/data/merged_vad.json")
    output_stats = Path("va-visualization/public/data/statistics.json")
    
    # 출력 디렉토리 생성
    output_json.parent.mkdir(parents=True, exist_ok=True)
    
    # CSV 읽기
    print(f"📖 CSV 파일 읽는 중: {input_csv}")
    df = pd.read_csv(input_csv)
    print(f"✅ {len(df):,} 항목 로드 완료\n")
    
    # 데이터 최적화 (병렬 처리)
    print("🔧 데이터 최적화 중 (병렬 처리)...")
    num_processes = min(cpu_count(), 8)  # 최대 8개 프로세스 사용
    print(f"   사용 프로세스 수: {num_processes}")
    
    # DataFrame을 리스트로 변환
    rows = [row for _, row in df.iterrows()]
    
    # 병렬 처리
    with Pool(processes=num_processes) as pool:
        optimized = list(tqdm(
            pool.imap(process_row, rows),
            total=len(rows),
            desc="데이터 처리",
            unit="행"
        ))
    
    # 통계 계산
    print("📊 통계 계산 중...")
    stats = {
        'total': len(optimized),
        'byStrategy': df['merge_strategy'].value_counts().to_dict(),
        'averageConfidence': float(df['confidence'].mean()),
        'quadrantDistribution': {
            'q1': len(df[(df['valence_mean'] >= 0) & (df['arousal_mean'] >= 0)]),
            'q2': len(df[(df['valence_mean'] < 0) & (df['arousal_mean'] >= 0)]),
            'q3': len(df[(df['valence_mean'] < 0) & (df['arousal_mean'] < 0)]),
            'q4': len(df[(df['valence_mean'] >= 0) & (df['arousal_mean'] < 0)]),
        }
    }
    
    # JSON 저장
    print(f"💾 JSON 파일 저장 중: {output_json}")
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(optimized, f, ensure_ascii=False, indent=None, separators=(',', ':'))
    
    # 통계 저장
    with open(output_stats, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    
    # 파일 크기 출력
    csv_size = input_csv.stat().st_size / 1024 / 1024
    json_size = output_json.stat().st_size / 1024 / 1024
    
    print("\n✅ 변환 완료!\n")
    print(f"📁 출력 파일:")
    print(f"   - {output_json}")
    print(f"   - {output_stats}\n")
    print(f"📊 파일 크기:")
    print(f"   - CSV:  {csv_size:.2f} MB")
    print(f"   - JSON: {json_size:.2f} MB")
    print(f"   - 압축률: {(1 - json_size/csv_size)*100:.1f}%\n")
    print(f"📊 데이터 통계:")
    print(f"   - 총 항목: {stats['total']:,}")
    print(f"   - 평균 신뢰도: {stats['averageConfidence']:.4f}")
    print(f"   - 사분면 분포:")
    print(f"     · Q1 (V+, A+): {stats['quadrantDistribution']['q1']:,}")
    print(f"     · Q2 (V-, A+): {stats['quadrantDistribution']['q2']:,}")
    print(f"     · Q3 (V-, A-): {stats['quadrantDistribution']['q3']:,}")
    print(f"     · Q4 (V+, A-): {stats['quadrantDistribution']['q4']:,}")

if __name__ == '__main__':
    main()

