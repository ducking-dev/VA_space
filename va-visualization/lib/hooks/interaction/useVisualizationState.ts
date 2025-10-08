/**
 * @file useVisualizationState.ts
 * @description 시각화 UI 상태(검색, 토글 등)를 관리하는 커스텀 훅
 */

import { useState, useCallback } from 'react';

export const useVisualizationState = (initialSearchTerm = '', initialShowPrototypes = true) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [showPrototypes, setShowPrototypes] = useState(initialShowPrototypes);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleTogglePrototypes = useCallback(() => {
    setShowPrototypes(prev => !prev);
  }, []);

  return {
    searchTerm,
    showPrototypes,
    handleSearchChange,
    handleTogglePrototypes,
  };
};
