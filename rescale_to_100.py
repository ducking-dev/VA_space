#!/usr/bin/env python3
"""
V-A 데이터 스케일 변환 스크립트
[-1, 1] 범위의 데이터를 [-100, 100] 범위로 변환
"""

import pandas as pd
import numpy as np
import logging
from pathlib import Path
from datetime import datetime

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def rescale_to_100(value):
    """
    [-1, 1] 범위의 값을 [-100, 100] 범위로 선형 변환
    
    공식: new_value = value * 100
    
    Args:
        value: [-1, 1] 범위의 값
        
    Returns:
        [-100, 100] 범위의 값
    """
    return value * 100

def main():
    logger.info("V-A 데이터 스케일 변환 시작: [-1, 1] → [-100, 100]")
    
    try:
        # 1. 기존 데이터 로딩
        logger.info("1. 기존 병합 데이터 로딩...")
        input_path = Path("data/processed/merged_vad.csv")
        
        if not input_path.exists():
            raise FileNotFoundError(f"입력 파일을 찾을 수 없습니다: {input_path}")
        
        df = pd.read_csv(input_path)
        logger.info(f"로딩된 데이터: {len(df):,} 항목")
        
        # 2. 스케일 변환
        logger.info("2. 스케일 변환 수행...")
        df_rescaled = df.copy()
        
        # VAD 차원별 변환
        vad_columns = ['valence_mean', 'arousal_mean', 'dominance_mean']
        
        for col in vad_columns:
            if col in df_rescaled.columns:
                original_values = df_rescaled[col]
                rescaled_values = rescale_to_100(original_values)
                df_rescaled[col] = rescaled_values
                
                # 변환 결과 검증
                original_min, original_max = original_values.min(), original_values.max()
                rescaled_min, rescaled_max = rescaled_values.min(), rescaled_values.max()
                
                logger.info(f"{col}: [{original_min:.3f}, {original_max:.3f}] → [{rescaled_min:.1f}, {rescaled_max:.1f}]")
        
        # 3. 변환 결과 검증
        logger.info("3. 변환 결과 검증...")
        validation_passed = True
        
        for col in vad_columns:
            if col in df_rescaled.columns:
                values = df_rescaled[col].dropna()
                min_val, max_val = values.min(), values.max()
                
                # [-100, 100] 범위 검증
                if min_val < -100.1 or max_val > 100.1:  # 약간의 여유 허용
                    logger.error(f"{col} 값이 예상 범위를 벗어남: [{min_val:.1f}, {max_val:.1f}]")
                    validation_passed = False
                else:
                    logger.info(f"{col} 범위 검증: ✓ [{min_val:.1f}, {max_val:.1f}]")
        
        if not validation_passed:
            raise ValueError("스케일 변환 검증 실패")
        
        # 4. 결과 저장
        logger.info("4. 변환된 데이터 저장...")
        output_path = Path("data/processed/merged_vad_100.csv")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        df_rescaled.to_csv(output_path, index=False, encoding='utf-8')
        logger.info(f"✓ 저장 완료: {output_path}")
        
        # 5. 통계 정보 출력
        logger.info("\n=== 변환 통계 ===")
        logger.info(f"총 항목 수: {len(df_rescaled):,}")
        
        # 병합 전략별 통계
        strategy_counts = df_rescaled['merge_strategy'].value_counts()
        for strategy, count in strategy_counts.items():
            logger.info(f"{strategy}: {count:,}")
        
        # VAD 통계
        for col in vad_columns:
            if col in df_rescaled.columns:
                values = df_rescaled[col].dropna()
                logger.info(f"{col}: 평균={values.mean():.1f}, 표준편차={values.std():.1f}")
        
        # 6. 샘플 데이터 출력
        logger.info("\n=== 변환 결과 샘플 ===")
        sample_cols = ['term', 'merge_strategy', 'valence_mean', 'arousal_mean', 'dominance_mean', 'confidence']
        sample_df = df_rescaled[sample_cols].head(10)
        
        for _, row in sample_df.iterrows():
            logger.info(f"{row['term']:<20} | {row['merge_strategy']:<12} | "
                       f"V:{row['valence_mean']:6.1f} A:{row['arousal_mean']:6.1f} D:{row['dominance_mean']:6.1f} | "
                       f"신뢰도:{row['confidence']:.3f}")
        
        # 7. 메타데이터 생성
        metadata = {
            'creation_time': datetime.now().isoformat(),
            'source_file': str(input_path),
            'scale_transformation': '[-1, 1] → [-100, 100]',
            'transformation_formula': 'new_value = original_value * 100',
            'total_entries': int(len(df_rescaled)),
            'columns': list(df_rescaled.columns),
            'validation_passed': validation_passed,
            'vad_statistics': {
                col: {
                    'min': float(df_rescaled[col].min()),
                    'max': float(df_rescaled[col].max()),
                    'mean': float(df_rescaled[col].mean()),
                    'std': float(df_rescaled[col].std())
                } for col in vad_columns if col in df_rescaled.columns
            }
        }
        
        metadata_path = output_path.with_suffix('.json')
        import json
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        logger.info(f"✓ 메타데이터 저장: {metadata_path}")
        
        logger.info("\n" + "=" * 60)
        logger.info("스케일 변환 완료!")
        logger.info(f"원본: {input_path} ([-1, 1] 범위)")
        logger.info(f"변환: {output_path} ([-100, 100] 범위)")
        logger.info(f"총 항목: {len(df_rescaled):,}")
        logger.info("=" * 60)
        
        return df_rescaled
        
    except Exception as e:
        logger.error(f"스케일 변환 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    rescaled_data = main()
