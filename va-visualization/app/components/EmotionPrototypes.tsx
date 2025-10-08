/**
 * @file EmotionPrototypes.tsx
 * @description 감정 프로토타입 표시 컴포넌트
 * @principle Presentation Component - 기본 감정 중심점 시각화
 */

'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { EMOTION_PROTOTYPES, ANIMATION_DURATION, ANIMATION_DELAY } from '@/lib/constants/visualization.const';
import type { IEmotionPrototype } from '@/lib/types/emotion.types';

// ============================================================================
// Individual Prototype Component
// ============================================================================

interface IPrototypePointProps {
  prototype: IEmotionPrototype;
  index: number;
  visible: boolean;
}

const PrototypePoint = memo<IPrototypePointProps>(({ prototype, index, visible }) => {
  if (!visible) return null;

  const { name, valence, arousal, color, description } = prototype;

  return (
    <g>
      {/* 프로토타입 점 */}
      <motion.circle
        cx={valence}
        cy={arousal}
        r="0.012"
        fill={color}
        stroke="white"
        strokeWidth="0.003"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          duration: ANIMATION_DURATION.NORMAL / 1000,
          delay: index * ANIMATION_DELAY.LONG / 1000,
          ease: 'easeOut',
        }}
        whileHover={{
          scale: 1.3,
          transition: { duration: ANIMATION_DURATION.FAST / 1000 },
        }}
        className="cursor-pointer"
      >
        {description && <title>{description}</title>}
      </motion.circle>

      {/* 라벨 */}
      <motion.text
        x={valence}
        y={arousal - 0.025}
        textAnchor="middle"
        fontSize="0.02"
        fontWeight="bold"
        fill="#374151"
        initial={{ opacity: 0, y: arousal - 0.015 }}
        animate={{ opacity: 1, y: arousal - 0.025 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: ANIMATION_DURATION.NORMAL / 1000,
          delay: index * ANIMATION_DELAY.LONG / 1000 + 0.2,
        }}
        className="pointer-events-none select-none"
      >
        {name}
      </motion.text>

      {/* 빛나는 효과 (선택적) */}
      <motion.circle
        cx={valence}
        cy={arousal}
        r="0.015"
        fill={color}
        opacity={0.2}
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: index * 0.1,
        }}
        className="pointer-events-none"
      />
    </g>
  );
});

PrototypePoint.displayName = 'PrototypePoint';

// ============================================================================
// Main EmotionPrototypes Component
// ============================================================================

export interface IEmotionPrototypesProps {
  visible?: boolean;
  showLabels?: boolean;
  prototypes?: Record<string, IEmotionPrototype>;
}

/**
 * 감정 프로토타입 컴포넌트
 */
export const EmotionPrototypes = memo<IEmotionPrototypesProps>(({
  visible = true,
  showLabels = true,
  prototypes = EMOTION_PROTOTYPES,
}) => {
  const prototypeArray = Object.values(prototypes);

  return (
    <g className="emotion-prototypes">
      {prototypeArray.map((prototype, index) => (
        <PrototypePoint
          key={prototype.name}
          prototype={prototype}
          index={index}
          visible={visible}
        />
      ))}
    </g>
  );
});

EmotionPrototypes.displayName = 'EmotionPrototypes';

// ============================================================================
// Interactive Prototypes (클릭/선택 가능)
// ============================================================================

export interface IInteractivePrototypesProps extends IEmotionPrototypesProps {
  onSelect?: (prototype: IEmotionPrototype) => void;
  selected?: string | null;
}

/**
 * 상호작용 가능한 감정 프로토타입
 */
export const InteractivePrototypes = memo<IInteractivePrototypesProps>(({
  visible = true,
  showLabels = true,
  prototypes = EMOTION_PROTOTYPES,
  onSelect,
  selected,
}) => {
  const prototypeArray = Object.values(prototypes);

  const handleClick = (prototype: IEmotionPrototype) => {
    if (onSelect) {
      onSelect(prototype);
    }
  };

  return (
    <g className="interactive-prototypes">
      {prototypeArray.map((prototype, index) => {
        const isSelected = selected === prototype.name;

        return (
          <g key={prototype.name}>
            {/* 선택 표시 */}
            {isSelected && (
              <motion.circle
                cx={prototype.valence}
                cy={prototype.arousal}
                r="0.02"
                fill="none"
                stroke={prototype.color}
                strokeWidth="0.003"
                initial={{ scale: 0 }}
                animate={{ scale: 1, opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              />
            )}

            {/* 프로토타입 점 */}
            <motion.circle
              cx={prototype.valence}
              cy={prototype.arousal}
              r={isSelected ? "0.015" : "0.012"}
              fill={prototype.color}
              stroke="white"
              strokeWidth="0.003"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: ANIMATION_DURATION.NORMAL / 1000,
                delay: index * ANIMATION_DELAY.LONG / 1000,
              }}
              whileHover={{
                scale: 1.3,
                transition: { duration: ANIMATION_DURATION.FAST / 1000 },
              }}
              onClick={() => handleClick(prototype)}
              className="cursor-pointer"
            >
              <title>{prototype.description || prototype.name}</title>
            </motion.circle>

            {/* 라벨 */}
            {showLabels && (
              <motion.text
                x={prototype.valence}
                y={prototype.arousal - 0.025}
                textAnchor="middle"
                fontSize={isSelected ? "0.022" : "0.02"}
                fontWeight="bold"
                fill={isSelected ? prototype.color : "#374151"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: ANIMATION_DURATION.NORMAL / 1000,
                  delay: index * ANIMATION_DELAY.LONG / 1000 + 0.2,
                }}
                onClick={() => handleClick(prototype)}
                className="cursor-pointer select-none"
              >
                {prototype.name}
              </motion.text>
            )}
          </g>
        );
      })}
    </g>
  );
});

InteractivePrototypes.displayName = 'InteractivePrototypes';

// ============================================================================
// Prototype Legend Component
// ============================================================================

export interface IPrototypeLegendProps {
  prototypes?: Record<string, IEmotionPrototype>;
  onSelect?: (name: string) => void;
  selected?: string | null;
}

/**
 * 프로토타입 범례 컴포넌트 (UI 외부)
 */
export const PrototypeLegend = memo<IPrototypeLegendProps>(({
  prototypes = EMOTION_PROTOTYPES,
  onSelect,
  selected,
}) => {
  const prototypeArray = Object.values(prototypes);

  return (
    <div className="flex flex-wrap gap-2">
      {prototypeArray.map((prototype) => {
        const isSelected = selected === prototype.name;

        return (
          <button
            key={prototype.name}
            onClick={() => onSelect?.(prototype.name)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              isSelected
                ? 'border-gray-400 bg-gray-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: prototype.color }}
            />
            <span className="text-sm font-medium text-gray-700">
              {prototype.name}
            </span>
          </button>
        );
      })}
    </div>
  );
});

PrototypeLegend.displayName = 'PrototypeLegend';
