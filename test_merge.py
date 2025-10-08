#!/usr/bin/env python3
"""
간단한 V-A 데이터 병합 테스트 스크립트
"""

import sys
import os
from pathlib import Path
import pandas as pd
import numpy as np
import logging
from datetime import datetime
import multiprocessing as mp
from tqdm import tqdm
import re
import time

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def normalize_term(term):
    """단어/구문 정규화"""
    if pd.isna(term):
        return ""
    normalized = str(term).lower().strip()
    normalized = re.sub(r'[^\w\s\-]', '', normalized)
    normalized = re.sub(r'\s+', ' ', normalized)
    return normalized

def normalize_warriner_scale(value):
    """Warriner 1-9 스케일을 [-1, 1]로 변환"""
    return (value - 5.0) / 4.0

def main():
    logger.info("V-A 데이터 병합 테스트 시작")
    
    try:
        # 1. Warriner 데이터 로딩
        logger.info("1. Warriner 데이터 로딩...")
        warriner_path = "data/Warriner_2013_kaggle/Ratings_VAD_Warriner.csv"
        warriner_df = pd.read_csv(warriner_path)
        logger.info(f"Warriner 데이터: {len(warriner_df):,} 항목")
        
        # 2. NRC VAD 데이터 로딩
        logger.info("2. NRC VAD 데이터 로딩...")
        nrc_path = "data/NRC-VAD-Lexicon-v2.1/NRC-VAD-Lexicon-v2.1.txt"
        nrc_df = pd.read_csv(nrc_path, sep='\t')
        logger.info(f"NRC VAD 데이터: {len(nrc_df):,} 항목")
        
        # 3. Warriner 스케일 정규화
        logger.info("3. Warriner 스케일 정규화...")
        warriner_df['valence'] = normalize_warriner_scale(warriner_df['valence'])
        warriner_df['arousal'] = normalize_warriner_scale(warriner_df['arousal'])
        warriner_df['dominance'] = normalize_warriner_scale(warriner_df['dominance'])
        logger.info("✓ Warriner 정규화 완료")
        
        # 4. 정규화된 키 생성
        logger.info("4. 정규화된 키 생성...")
        warriner_dict = {}
        for _, row in tqdm(warriner_df.iterrows(), desc="Warriner 인덱싱", total=len(warriner_df)):
            key = normalize_term(row['word'])
            if key:
                warriner_dict[key] = {
                    'valence': row['valence'],
                    'arousal': row['arousal'],
                    'dominance': row['dominance']
                }
        
        nrc_dict = {}
        for _, row in tqdm(nrc_df.iterrows(), desc="NRC VAD 인덱싱", total=len(nrc_df)):
            key = normalize_term(row['term'])
            if key:
                nrc_dict[key] = {
                    'valence': row['valence'],
                    'arousal': row['arousal'],
                    'dominance': row['dominance']
                }
        
        # 5. 병합 통계
        all_keys = set(warriner_dict.keys()) | set(nrc_dict.keys())
        overlap_keys = set(warriner_dict.keys()) & set(nrc_dict.keys())
        
        logger.info(f"총 고유 단어: {len(all_keys):,}")
        logger.info(f"Warriner 단어: {len(warriner_dict):,}")
        logger.info(f"NRC VAD 단어: {len(nrc_dict):,}")
        logger.info(f"교집합: {len(overlap_keys):,}")
        
        # 6. 병합 데이터 생성
        logger.info("6. 데이터 병합...")
        merged_data = []
        
        for term in tqdm(all_keys, desc="병합 진행"):
            warriner_data = warriner_dict.get(term)
            nrc_data = nrc_dict.get(term)
            
            entry = {
                'term': term,
                'source_warriner': warriner_data is not None,
                'source_nrc': nrc_data is not None,
                'is_multiword': ' ' in term,
            }
            
            if warriner_data and nrc_data:
                # 가중 평균 (간단히 1:1 비율)
                entry['valence_mean'] = (warriner_data['valence'] + nrc_data['valence']) / 2
                entry['arousal_mean'] = (warriner_data['arousal'] + nrc_data['arousal']) / 2
                entry['dominance_mean'] = (warriner_data['dominance'] + nrc_data['dominance']) / 2
                entry['merge_strategy'] = 'both_weighted'
                entry['confidence'] = 0.9
            elif warriner_data:
                entry['valence_mean'] = warriner_data['valence']
                entry['arousal_mean'] = warriner_data['arousal']
                entry['dominance_mean'] = warriner_data['dominance']
                entry['merge_strategy'] = 'warriner_only'
                entry['confidence'] = 0.8
            elif nrc_data:
                entry['valence_mean'] = nrc_data['valence']
                entry['arousal_mean'] = nrc_data['arousal']
                entry['dominance_mean'] = nrc_data['dominance']
                entry['merge_strategy'] = 'nrc_only'
                entry['confidence'] = 0.7
            
            merged_data.append(entry)
        
        # 7. 데이터프레임 생성 및 저장
        logger.info("7. 결과 저장...")
        merged_df = pd.DataFrame(merged_data)
        
        # 출력 디렉토리 생성
        output_dir = Path("data/processed")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # CSV 저장
        output_path = output_dir / "merged_vad.csv"
        merged_df.to_csv(output_path, index=False, encoding='utf-8')
        
        logger.info(f"✓ 병합 완료: {len(merged_df):,} 항목")
        logger.info(f"✓ 저장 완료: {output_path}")
        
        # 8. 통계 출력
        logger.info("\n=== 병합 통계 ===")
        strategy_counts = merged_df['merge_strategy'].value_counts()
        for strategy, count in strategy_counts.items():
            logger.info(f"{strategy}: {count:,}")
        
        logger.info(f"단일어: {len(merged_df[~merged_df['is_multiword']]):,}")
        logger.info(f"다중어: {len(merged_df[merged_df['is_multiword']]):,}")
        logger.info(f"평균 신뢰도: {merged_df['confidence'].mean():.3f}")
        
        # 샘플 출력
        logger.info("\n=== 샘플 데이터 ===")
        sample = merged_df[['term', 'merge_strategy', 'valence_mean', 'arousal_mean', 'confidence']].head(10)
        for _, row in sample.iterrows():
            logger.info(f"{row['term']:<20} | {row['merge_strategy']:<12} | "
                       f"V:{row['valence_mean']:6.3f} A:{row['arousal_mean']:6.3f} | "
                       f"신뢰도:{row['confidence']:.3f}")
        
        logger.info("\n병합 완료!")
        return merged_df
        
    except Exception as e:
        logger.error(f"오류 발생: {e}")
        raise

if __name__ == "__main__":
    main()
