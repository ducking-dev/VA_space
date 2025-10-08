"""
스케일 정규화 모듈
Warriner (1-9)와 NRC VAD (-1~1) 스케일을 [-1, 1]로 통일
"""

import pandas as pd
import numpy as np
from typing import Union, Tuple
import logging

logger = logging.getLogger(__name__)

class VADScaler:
    """VAD 스케일 정규화 클래스"""
    
    def __init__(self):
        # Warriner 스케일 정보 (1-9 범위)
        self.warriner_min = 1.0
        self.warriner_max = 9.0
        self.warriner_center = 5.0
        self.warriner_range = 4.0  # (9-1)/2
        
        # NRC VAD는 이미 [-1, 1] 범위
        self.nrc_min = -1.0
        self.nrc_max = 1.0
        
    def normalize_warriner_scale(self, value: Union[float, np.ndarray, pd.Series]) -> Union[float, np.ndarray, pd.Series]:
        """
        Warriner 1-9 스케일을 [-1, 1]로 선형 변환
        
        공식: (value - 5) / 4 = [-1, 1] 범위
        - 1 → -1
        - 5 → 0  
        - 9 → 1
        
        Args:
            value: 변환할 값 (1-9 범위)
            
        Returns:
            변환된 값 ([-1, 1] 범위)
        """
        return (value - self.warriner_center) / self.warriner_range
    
    def normalize_nrc_scale(self, value: Union[float, np.ndarray, pd.Series]) -> Union[float, np.ndarray, pd.Series]:
        """
        NRC VAD 스케일 정규화 (이미 [-1, 1] 범위이므로 그대로 반환)
        
        Args:
            value: NRC VAD 값
            
        Returns:
            동일한 값 (이미 [-1, 1] 범위)
        """
        return value
    
    def normalize_warriner_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Warriner 데이터프레임의 VAD 컬럼들을 정규화
        
        Args:
            df: Warriner 데이터프레임 (word, valence, arousal, dominance 컬럼 포함)
            
        Returns:
            정규화된 데이터프레임
        """
        df_normalized = df.copy()
        
        # VAD 컬럼들 정규화
        vad_columns = ['valence', 'arousal', 'dominance']
        
        for col in vad_columns:
            if col in df_normalized.columns:
                original_values = df_normalized[col]
                normalized_values = self.normalize_warriner_scale(original_values)
                df_normalized[col] = normalized_values
                
                logger.info(f"Warriner {col}: {original_values.min():.3f}-{original_values.max():.3f} → {normalized_values.min():.3f}-{normalized_values.max():.3f}")
        
        return df_normalized
    
    def normalize_nrc_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        NRC VAD 데이터프레임 정규화 (이미 [-1, 1] 범위이므로 검증만 수행)
        
        Args:
            df: NRC VAD 데이터프레임
            
        Returns:
            검증된 데이터프레임
        """
        df_normalized = df.copy()
        
        # VAD 컬럼들 검증
        vad_columns = ['valence', 'arousal', 'dominance']
        
        for col in vad_columns:
            if col in df_normalized.columns:
                values = df_normalized[col]
                min_val, max_val = values.min(), values.max()
                
                # [-1, 1] 범위 검증
                if min_val < -1.1 or max_val > 1.1:  # 약간의 여유 허용
                    logger.warning(f"NRC {col} values outside expected range [-1, 1]: [{min_val:.3f}, {max_val:.3f}]")
                
                # 범위 클리핑 (필요시)
                df_normalized[col] = np.clip(values, -1.0, 1.0)
                
                logger.info(f"NRC {col}: [{min_val:.3f}, {max_val:.3f}] (already normalized)")
        
        return df_normalized
    
    def get_scale_statistics(self, df: pd.DataFrame, name: str) -> dict:
        """
        정규화된 데이터의 스케일 통계 정보
        
        Args:
            df: 분석할 데이터프레임
            name: 데이터셋 이름
            
        Returns:
            통계 정보 딕셔너리
        """
        stats = {'dataset': name}
        
        vad_columns = ['valence', 'arousal', 'dominance']
        for col in vad_columns:
            if col in df.columns:
                values = df[col]
                stats[f'{col}_min'] = values.min()
                stats[f'{col}_max'] = values.max()
                stats[f'{col}_mean'] = values.mean()
                stats[f'{col}_std'] = values.std()
                stats[f'{col}_range_check'] = (-1.0 <= values.min()) and (values.max() <= 1.0)
        
        return stats
    
    def validate_normalization(self, df: pd.DataFrame, name: str) -> bool:
        """
        정규화 결과 검증
        
        Args:
            df: 검증할 데이터프레임
            name: 데이터셋 이름
            
        Returns:
            검증 통과 여부
        """
        stats = self.get_scale_statistics(df, name)
        
        vad_columns = ['valence', 'arousal', 'dominance']
        all_valid = True
        
        for col in vad_columns:
            if col in df.columns:
                range_valid = stats[f'{col}_range_check']
                if not range_valid:
                    logger.error(f"{name} {col} values outside [-1, 1] range!")
                    all_valid = False
                else:
                    logger.info(f"{name} {col} normalization: ✓")
        
        return all_valid


if __name__ == "__main__":
    # 테스트 실행
    import sys
    sys.path.append('..')
    from data_processing.loader import DataLoader
    
    # 데이터 로딩
    loader = DataLoader()
    warriner_df, nrc_df = loader.load_all_data()
    
    # 스케일러 초기화
    scaler = VADScaler()
    
    # 정규화 수행
    print("\n=== 스케일 정규화 ===")
    warriner_normalized = scaler.normalize_warriner_dataframe(warriner_df)
    nrc_normalized = scaler.normalize_nrc_dataframe(nrc_df)
    
    # 검증
    print("\n=== 정규화 검증 ===")
    warriner_valid = scaler.validate_normalization(warriner_normalized, "Warriner")
    nrc_valid = scaler.validate_normalization(nrc_normalized, "NRC VAD")
    
    print(f"\nWarriner 정규화 성공: {warriner_valid}")
    print(f"NRC VAD 정규화 성공: {nrc_valid}")
    
    # 샘플 출력
    print(f"\nWarriner 정규화 샘플:")
    print(warriner_normalized[['word', 'valence', 'arousal', 'dominance']].head())
    print(f"\nNRC VAD 정규화 샘플:")
    print(nrc_normalized[['term', 'valence', 'arousal', 'dominance']].head())
