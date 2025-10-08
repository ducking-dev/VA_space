"""
데이터 병합 모듈
Warriner와 NRC VAD 데이터를 지능적으로 병합하는 멀티프로세싱 구현
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import multiprocessing as mp
from functools import partial
import logging
from tqdm import tqdm
import re
import time

logger = logging.getLogger(__name__)

class VADMerger:
    """VAD 데이터 병합 클래스"""
    
    def __init__(self, n_processes: Optional[int] = None):
        self.n_processes = n_processes or mp.cpu_count()
        logger.info(f"Using {self.n_processes} processes for merging")
        
    def normalize_term(self, term: str) -> str:
        """
        단어/구문 정규화
        
        Args:
            term: 정규화할 단어/구문
            
        Returns:
            정규화된 단어/구문
        """
        if pd.isna(term):
            return ""
            
        # 기본 정규화
        normalized = str(term).lower().strip()
        
        # 특수문자 정리 (하이픈과 공백은 유지)
        normalized = re.sub(r'[^\w\s\-]', '', normalized)
        
        # 연속된 공백을 하나로
        normalized = re.sub(r'\s+', ' ', normalized)
        
        return normalized
    
    def calculate_confidence_weight(self, valence_sd: Optional[float], 
                                  arousal_sd: Optional[float], 
                                  dominance_sd: Optional[float]) -> float:
        """
        Warriner 표준편차 기반 신뢰도 가중치 계산
        
        Args:
            valence_sd, arousal_sd, dominance_sd: 표준편차 값들
            
        Returns:
            신뢰도 가중치 (SD가 낮을수록 높은 가중치)
        """
        # 유효한 SD 값들만 사용
        valid_sds = [sd for sd in [valence_sd, arousal_sd, dominance_sd] if pd.notna(sd) and sd > 0]
        
        if not valid_sds:
            return 1.0  # SD 정보가 없으면 기본 가중치
            
        # 평균 SD의 역수로 가중치 계산 (SD가 낮을수록 신뢰도 높음)
        mean_sd = np.mean(valid_sds)
        confidence_weight = 1.0 / (mean_sd + 0.1)  # 0으로 나누기 방지
        
        return confidence_weight
    
    def weighted_merge_values(self, warriner_val: float, nrc_val: float, 
                            warriner_weight: float, nrc_weight: float = 1.0) -> Tuple[float, float]:
        """
        가중 평균으로 값 병합
        
        Args:
            warriner_val, nrc_val: 병합할 값들
            warriner_weight, nrc_weight: 각각의 가중치
            
        Returns:
            (병합된 값, 총 가중치)
        """
        if pd.isna(warriner_val) and pd.isna(nrc_val):
            return np.nan, 0.0
        elif pd.isna(warriner_val):
            return nrc_val, nrc_weight
        elif pd.isna(nrc_val):
            return warriner_val, warriner_weight
        else:
            total_weight = warriner_weight + nrc_weight
            merged_val = (warriner_weight * warriner_val + nrc_weight * nrc_val) / total_weight
            return merged_val, total_weight
    
    def merge_single_entry(self, term: str, warriner_data: Optional[Dict], 
                          nrc_data: Optional[Dict]) -> Dict:
        """
        단일 항목 병합
        
        Args:
            term: 정규화된 단어/구문
            warriner_data: Warriner 데이터 (None이면 없음)
            nrc_data: NRC VAD 데이터 (None이면 없음)
            
        Returns:
            병합된 항목 딕셔너리
        """
        result = {
            'term': term,
            'source_warriner': warriner_data is not None,
            'source_nrc': nrc_data is not None,
            'is_multiword': ' ' in term,
        }
        
        if warriner_data and nrc_data:
            # 두 소스 모두 존재 - 가중 평균
            warriner_weight = self.calculate_confidence_weight(
                warriner_data.get('valence_sd'),
                warriner_data.get('arousal_sd'), 
                warriner_data.get('dominance_sd')
            )
            
            # VAD 각 차원별 병합
            for dim in ['valence', 'arousal', 'dominance']:
                merged_val, total_weight = self.weighted_merge_values(
                    warriner_data.get(dim), nrc_data.get(dim), 
                    warriner_weight, 1.0
                )
                result[f'{dim}_mean'] = merged_val
                result[f'{dim}_weight'] = total_weight
                
                # Warriner SD 정보 보존
                result[f'{dim}_sd'] = warriner_data.get(f'{dim}_sd')
            
            result['merge_strategy'] = 'both_weighted'
            result['confidence'] = min(1.0, warriner_weight / (warriner_weight + 1.0))
            
        elif warriner_data:
            # Warriner만 존재
            for dim in ['valence', 'arousal', 'dominance']:
                result[f'{dim}_mean'] = warriner_data.get(dim)
                result[f'{dim}_sd'] = warriner_data.get(f'{dim}_sd')
                result[f'{dim}_weight'] = 1.0
                
            result['merge_strategy'] = 'warriner_only'
            result['confidence'] = 0.9  # 높은 신뢰도
            
        elif nrc_data:
            # NRC VAD만 존재
            for dim in ['valence', 'arousal', 'dominance']:
                result[f'{dim}_mean'] = nrc_data.get(dim)
                result[f'{dim}_sd'] = None
                result[f'{dim}_weight'] = 1.0
                
            result['merge_strategy'] = 'nrc_only'
            result['confidence'] = 0.8  # 중간 신뢰도
            
        else:
            # 둘 다 없음 (이론적으로 발생하지 않아야 함)
            for dim in ['valence', 'arousal', 'dominance']:
                result[f'{dim}_mean'] = np.nan
                result[f'{dim}_sd'] = None
                result[f'{dim}_weight'] = 0.0
                
            result['merge_strategy'] = 'missing'
            result['confidence'] = 0.0
            
        return result
    
    def process_chunk(self, chunk_data: List[Tuple], chunk_id: int) -> List[Dict]:
        """
        데이터 청크 처리 (멀티프로세싱용)
        
        Args:
            chunk_data: 처리할 데이터 청크
            chunk_id: 청크 ID
            
        Returns:
            처리된 결과 리스트
        """
        results = []
        
        with tqdm(desc=f"Chunk {chunk_id}", leave=False, total=len(chunk_data)) as pbar:
            for term, warriner_data, nrc_data in chunk_data:
                merged_entry = self.merge_single_entry(term, warriner_data, nrc_data)
                results.append(merged_entry)
                pbar.update(1)
                
        return results
    
    def prepare_merge_data(self, warriner_df: pd.DataFrame, nrc_df: pd.DataFrame) -> List[Tuple]:
        """
        병합을 위한 데이터 준비
        
        Args:
            warriner_df: 정규화된 Warriner 데이터
            nrc_df: 정규화된 NRC VAD 데이터
            
        Returns:
            병합용 데이터 리스트 [(term, warriner_data, nrc_data), ...]
        """
        logger.info("Preparing data for merging...")
        
        # 정규화된 키로 인덱싱
        warriner_dict = {}
        for _, row in tqdm(warriner_df.iterrows(), desc="Indexing Warriner", total=len(warriner_df)):
            normalized_key = self.normalize_term(row['word'])
            if normalized_key:
                warriner_dict[normalized_key] = {
                    'valence': row['valence'],
                    'arousal': row['arousal'], 
                    'dominance': row['dominance'],
                    'valence_sd': row.get('valence_sd'),
                    'arousal_sd': row.get('arousal_sd'),
                    'dominance_sd': row.get('dominance_sd'),
                }
        
        nrc_dict = {}
        for _, row in tqdm(nrc_df.iterrows(), desc="Indexing NRC VAD", total=len(nrc_df)):
            normalized_key = self.normalize_term(row['term'])
            if normalized_key:
                nrc_dict[normalized_key] = {
                    'valence': row['valence'],
                    'arousal': row['arousal'],
                    'dominance': row['dominance'],
                }
        
        # 모든 고유 키 수집
        all_keys = set(warriner_dict.keys()) | set(nrc_dict.keys())
        logger.info(f"Total unique terms: {len(all_keys):,}")
        logger.info(f"Warriner terms: {len(warriner_dict):,}")
        logger.info(f"NRC VAD terms: {len(nrc_dict):,}")
        logger.info(f"Overlap: {len(set(warriner_dict.keys()) & set(nrc_dict.keys())):,}")
        
        # 병합 데이터 준비
        merge_data = []
        for term in all_keys:
            warriner_data = warriner_dict.get(term)
            nrc_data = nrc_dict.get(term)
            merge_data.append((term, warriner_data, nrc_data))
            
        return merge_data
    
    def merge_datasets(self, warriner_df: pd.DataFrame, nrc_df: pd.DataFrame) -> pd.DataFrame:
        """
        데이터셋 병합 (멀티프로세싱)
        
        Args:
            warriner_df: 정규화된 Warriner 데이터
            nrc_df: 정규화된 NRC VAD 데이터
            
        Returns:
            병합된 데이터프레임
        """
        start_time = time.time()
        
        # 병합 데이터 준비
        merge_data = self.prepare_merge_data(warriner_df, nrc_df)
        
        # 청크로 분할
        chunk_size = max(1, len(merge_data) // self.n_processes)
        chunks = [merge_data[i:i + chunk_size] for i in range(0, len(merge_data), chunk_size)]
        
        logger.info(f"Processing {len(merge_data):,} entries in {len(chunks)} chunks")
        
        # 멀티프로세싱 실행
        with mp.Pool(self.n_processes) as pool:
            # 각 청크를 병렬 처리
            chunk_processor = partial(self.process_chunk_wrapper)
            results = pool.starmap(chunk_processor, [(chunk, i) for i, chunk in enumerate(chunks)])
        
        # 결과 병합
        all_results = []
        for chunk_results in results:
            all_results.extend(chunk_results)
            
        # 데이터프레임 생성
        merged_df = pd.DataFrame(all_results)
        
        elapsed_time = time.time() - start_time
        logger.info(f"Merging completed in {elapsed_time:.2f} seconds")
        logger.info(f"Final dataset size: {len(merged_df):,} entries")
        
        return merged_df
    
    def process_chunk_wrapper(self, chunk_data: List[Tuple], chunk_id: int) -> List[Dict]:
        """멀티프로세싱을 위한 래퍼 함수"""
        return self.process_chunk(chunk_data, chunk_id)
    
    def get_merge_statistics(self, merged_df: pd.DataFrame) -> Dict:
        """
        병합 결과 통계
        
        Args:
            merged_df: 병합된 데이터프레임
            
        Returns:
            통계 정보 딕셔너리
        """
        stats = {
            'total_entries': len(merged_df),
            'warriner_only': len(merged_df[merged_df['merge_strategy'] == 'warriner_only']),
            'nrc_only': len(merged_df[merged_df['merge_strategy'] == 'nrc_only']),
            'both_weighted': len(merged_df[merged_df['merge_strategy'] == 'both_weighted']),
            'multiword_expressions': len(merged_df[merged_df['is_multiword'] == True]),
            'single_words': len(merged_df[merged_df['is_multiword'] == False]),
        }
        
        # 신뢰도 통계
        stats['avg_confidence'] = merged_df['confidence'].mean()
        stats['high_confidence'] = len(merged_df[merged_df['confidence'] >= 0.8])
        
        # VAD 범위 검증
        for dim in ['valence', 'arousal', 'dominance']:
            col = f'{dim}_mean'
            if col in merged_df.columns:
                valid_values = merged_df[col].dropna()
                stats[f'{dim}_in_range'] = len(valid_values[(valid_values >= -1.0) & (valid_values <= 1.0)])
                stats[f'{dim}_out_of_range'] = len(valid_values[(valid_values < -1.0) | (valid_values > 1.0)])
        
        return stats


if __name__ == "__main__":
    # 테스트 실행
    import sys
    sys.path.append('..')
    from data_processing.loader import DataLoader
    from normalization.scaler import VADScaler
    
    # 데이터 로딩 및 정규화
    loader = DataLoader()
    scaler = VADScaler()
    
    print("Loading and normalizing data...")
    warriner_df, nrc_df = loader.load_all_data()
    warriner_normalized = scaler.normalize_warriner_dataframe(warriner_df)
    nrc_normalized = scaler.normalize_nrc_dataframe(nrc_df)
    
    # 병합 실행
    merger = VADMerger(n_processes=4)
    print("\nMerging datasets...")
    merged_df = merger.merge_datasets(warriner_normalized, nrc_normalized)
    
    # 통계 출력
    stats = merger.get_merge_statistics(merged_df)
    print("\n=== 병합 통계 ===")
    for key, value in stats.items():
        print(f"{key}: {value:,}")
    
    # 샘플 출력
    print(f"\n병합 결과 샘플:")
    print(merged_df[['term', 'merge_strategy', 'valence_mean', 'arousal_mean', 'confidence']].head(10))
