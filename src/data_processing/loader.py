"""
데이터 로딩 모듈
Warriner 2013과 NRC VAD v2.1 데이터를 로딩하고 기본 전처리를 수행
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Tuple, Dict, Any
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataLoader:
    """데이터 로딩 및 기본 전처리 클래스"""
    
    def __init__(self, data_root: str = "data"):
        self.data_root = Path(data_root)
        self.warriner_path = self.data_root / "Warriner_2013_kaggle" / "Ratings_VAD_Warriner.csv"
        self.nrc_path = self.data_root / "NRC-VAD-Lexicon-v2.1" / "NRC-VAD-Lexicon-v2.1.txt"
        
    def load_warriner_data(self) -> pd.DataFrame:
        """
        Warriner 2013 데이터 로딩
        
        Returns:
            pd.DataFrame: 컬럼 [word, valence, arousal, dominance]
        """
        logger.info(f"Loading Warriner data from {self.warriner_path}")
        
        try:
            df = pd.read_csv(self.warriner_path)
            logger.info(f"Loaded {len(df)} Warriner entries")
            
            # 기본 검증
            required_cols = ['word', 'valence', 'arousal', 'dominance']
            if not all(col in df.columns for col in required_cols):
                raise ValueError(f"Missing required columns. Expected: {required_cols}")
                
            # 결측치 확인
            missing_count = df.isnull().sum().sum()
            if missing_count > 0:
                logger.warning(f"Found {missing_count} missing values in Warriner data")
                
            return df
            
        except Exception as e:
            logger.error(f"Error loading Warriner data: {e}")
            raise
            
    def load_nrc_data(self) -> pd.DataFrame:
        """
        NRC VAD v2.1 데이터 로딩
        
        Returns:
            pd.DataFrame: 컬럼 [term, valence, arousal, dominance]
        """
        logger.info(f"Loading NRC VAD data from {self.nrc_path}")
        
        try:
            # TSV 파일로 로딩 (탭 구분)
            df = pd.read_csv(self.nrc_path, sep='\t')
            logger.info(f"Loaded {len(df)} NRC VAD entries")
            
            # 기본 검증
            required_cols = ['term', 'valence', 'arousal', 'dominance']
            if not all(col in df.columns for col in required_cols):
                raise ValueError(f"Missing required columns. Expected: {required_cols}")
                
            # 결측치 확인
            missing_count = df.isnull().sum().sum()
            if missing_count > 0:
                logger.warning(f"Found {missing_count} missing values in NRC VAD data")
                
            return df
            
        except Exception as e:
            logger.error(f"Error loading NRC VAD data: {e}")
            raise
            
    def get_data_statistics(self, df: pd.DataFrame, name: str) -> Dict[str, Any]:
        """
        데이터 통계 정보 생성
        
        Args:
            df: 분석할 데이터프레임
            name: 데이터셋 이름
            
        Returns:
            Dict: 통계 정보
        """
        stats = {
            'name': name,
            'total_entries': len(df),
            'unique_terms': df.iloc[:, 0].nunique(),  # 첫 번째 컬럼 (word/term)
            'duplicates': len(df) - df.iloc[:, 0].nunique(),
        }
        
        # VAD 차원별 통계
        vad_cols = ['valence', 'arousal', 'dominance']
        for col in vad_cols:
            if col in df.columns:
                stats[f'{col}_mean'] = df[col].mean()
                stats[f'{col}_std'] = df[col].std()
                stats[f'{col}_min'] = df[col].min()
                stats[f'{col}_max'] = df[col].max()
                stats[f'{col}_missing'] = df[col].isnull().sum()
                
        return stats
        
    def load_all_data(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        모든 데이터 로딩 및 기본 통계 출력
        
        Returns:
            Tuple[pd.DataFrame, pd.DataFrame]: (warriner_df, nrc_df)
        """
        # 데이터 로딩
        warriner_df = self.load_warriner_data()
        nrc_df = self.load_nrc_data()
        
        # 통계 정보 출력
        warriner_stats = self.get_data_statistics(warriner_df, "Warriner 2013")
        nrc_stats = self.get_data_statistics(nrc_df, "NRC VAD v2.1")
        
        logger.info("=== 데이터 통계 ===")
        for stats in [warriner_stats, nrc_stats]:
            logger.info(f"\n{stats['name']}:")
            logger.info(f"  총 항목: {stats['total_entries']:,}")
            logger.info(f"  고유 단어: {stats['unique_terms']:,}")
            logger.info(f"  중복: {stats['duplicates']:,}")
            logger.info(f"  Valence: {stats['valence_mean']:.3f} ± {stats['valence_std']:.3f} [{stats['valence_min']:.3f}, {stats['valence_max']:.3f}]")
            logger.info(f"  Arousal: {stats['arousal_mean']:.3f} ± {stats['arousal_std']:.3f} [{stats['arousal_min']:.3f}, {stats['arousal_max']:.3f}]")
            logger.info(f"  Dominance: {stats['dominance_mean']:.3f} ± {stats['dominance_std']:.3f} [{stats['dominance_min']:.3f}, {stats['dominance_max']:.3f}]")
            
        return warriner_df, nrc_df


if __name__ == "__main__":
    # 테스트 실행
    loader = DataLoader()
    warriner_df, nrc_df = loader.load_all_data()
    
    print(f"\nWarriner 샘플:")
    print(warriner_df.head())
    print(f"\nNRC VAD 샘플:")
    print(nrc_df.head())
