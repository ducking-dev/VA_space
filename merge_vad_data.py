#!/usr/bin/env python3
"""
V-A 데이터 병합 메인 스크립트
Warriner 2013과 NRC VAD v2.1을 병합하여 통합 감정 어휘 사전 생성
"""

import sys
import os
from pathlib import Path
import pandas as pd
import numpy as np
import logging
from datetime import datetime
import argparse

# 프로젝트 경로 추가
sys.path.append(str(Path(__file__).parent / 'src'))

from data_processing.loader import DataLoader
from normalization.scaler import VADScaler
from merging.merger import VADMerger

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('merge_log.txt', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

def main():
    """메인 실행 함수"""
    parser = argparse.ArgumentParser(description='V-A 데이터 병합')
    parser.add_argument('--processes', '-p', type=int, default=None, 
                       help='사용할 프로세스 수 (기본값: CPU 코어 수)')
    parser.add_argument('--output', '-o', type=str, default='data/processed/merged_vad.csv',
                       help='출력 파일 경로')
    
    args = parser.parse_args()
    
    logger.info("=" * 60)
    logger.info("V-A 데이터 병합 시작")
    logger.info(f"시작 시간: {datetime.now()}")
    logger.info("=" * 60)
    
    try:
        # 1단계: 데이터 로딩
        logger.info("\n1단계: 데이터 로딩")
        loader = DataLoader()
        warriner_df, nrc_df = loader.load_all_data()
        
        # 2단계: 스케일 정규화
        logger.info("\n2단계: 스케일 정규화 [-1, 1]")
        scaler = VADScaler()
        
        warriner_normalized = scaler.normalize_warriner_dataframe(warriner_df)
        nrc_normalized = scaler.normalize_nrc_dataframe(nrc_df)
        
        # 정규화 검증
        warriner_valid = scaler.validate_normalization(warriner_normalized, "Warriner")
        nrc_valid = scaler.validate_normalization(nrc_normalized, "NRC VAD")
        
        if not (warriner_valid and nrc_valid):
            raise ValueError("스케일 정규화 검증 실패")
        
        logger.info("✓ 스케일 정규화 완료")
        
        # 3단계: 데이터 병합
        logger.info(f"\n3단계: 데이터 병합 (프로세스 수: {args.processes or 'auto'})")
        merger = VADMerger(n_processes=args.processes)
        merged_df = merger.merge_datasets(warriner_normalized, nrc_normalized)
        
        # 4단계: 결과 저장
        logger.info(f"\n4단계: 결과 저장 - {args.output}")
        
        # 출력 디렉토리 생성
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # CSV 저장
        merged_df.to_csv(output_path, index=False, encoding='utf-8')
        logger.info(f"✓ 병합된 데이터 저장 완료: {len(merged_df):,} 항목")
        
        # 5단계: 통계 및 품질 검증
        logger.info("\n5단계: 품질 검증 및 통계")
        stats = merger.get_merge_statistics(merged_df)
        
        logger.info("\n=== 최종 병합 통계 ===")
        logger.info(f"총 항목 수: {stats['total_entries']:,}")
        logger.info(f"  - Warriner만: {stats['warriner_only']:,}")
        logger.info(f"  - NRC VAD만: {stats['nrc_only']:,}")
        logger.info(f"  - 가중 병합: {stats['both_weighted']:,}")
        logger.info(f"단일어: {stats['single_words']:,}")
        logger.info(f"다중어 표현: {stats['multiword_expressions']:,}")
        logger.info(f"평균 신뢰도: {stats['avg_confidence']:.3f}")
        logger.info(f"고신뢰도 항목 (≥0.8): {stats['high_confidence']:,}")
        
        # VAD 범위 검증
        for dim in ['valence', 'arousal', 'dominance']:
            in_range = stats.get(f'{dim}_in_range', 0)
            out_range = stats.get(f'{dim}_out_of_range', 0)
            logger.info(f"{dim.capitalize()} 범위 검증: {in_range:,} 정상, {out_range:,} 범위 초과")
        
        # 샘플 데이터 출력
        logger.info("\n=== 병합 결과 샘플 ===")
        sample_cols = ['term', 'merge_strategy', 'valence_mean', 'arousal_mean', 'dominance_mean', 'confidence']
        sample_df = merged_df[sample_cols].head(10)
        
        for _, row in sample_df.iterrows():
            logger.info(f"{row['term']:<20} | {row['merge_strategy']:<12} | "
                       f"V:{row['valence_mean']:6.3f} A:{row['arousal_mean']:6.3f} D:{row['dominance_mean']:6.3f} | "
                       f"신뢰도:{row['confidence']:.3f}")
        
        # 메타데이터 저장
        metadata = {
            'creation_time': datetime.now().isoformat(),
            'total_entries': int(stats['total_entries']),
            'source_warriner_entries': len(warriner_df),
            'source_nrc_entries': len(nrc_df),
            'merge_statistics': stats,
            'scale_range': [-1.0, 1.0],
            'columns': list(merged_df.columns),
        }
        
        metadata_path = output_path.with_suffix('.json')
        import json
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        logger.info(f"✓ 메타데이터 저장: {metadata_path}")
        
        logger.info("\n" + "=" * 60)
        logger.info("V-A 데이터 병합 완료!")
        logger.info(f"완료 시간: {datetime.now()}")
        logger.info(f"최종 출력: {output_path} ({len(merged_df):,} 항목)")
        logger.info("=" * 60)
        
        return merged_df
        
    except Exception as e:
        logger.error(f"병합 과정에서 오류 발생: {e}")
        raise


if __name__ == "__main__":
    merged_data = main()