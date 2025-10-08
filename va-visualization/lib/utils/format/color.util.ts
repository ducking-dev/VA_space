/**
 * @file color.util.ts
 * @description 색상 변환 및 포맷팅 유틸리티
 * @principle Pure Functions - 사이드 이펙트 없는 순수 함수
 */

import type { IRGB, IRGBA, IHSL } from '@/lib/types/visualization.types';

// ============================================================================
// Color Format Conversion
// ============================================================================

/**
 * HEX → RGB 변환
 */
export function hexToRgb(hex: string): IRGB | null {
  // #을 제거하고 정규화
  const sanitized = hex.replace(/^#/, '');
  
  // 3자리 HEX 처리 (#RGB → #RRGGBB)
  const expanded = sanitized.length === 3
    ? sanitized.split('').map(c => c + c).join('')
    : sanitized;
  
  const match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(expanded);
  
  if (!match) return null;
  
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

/**
 * RGB → HEX 변환
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * RGB 객체 → HEX 변환
 */
export function rgbObjectToHex(rgb: IRGB): string {
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * RGB → HSL 변환
 */
export function rgbToHsl(r: number, g: number, b: number): IHSL {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * HSL → RGB 변환
 */
export function hslToRgb(h: number, s: number, l: number): IRGB {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r: number, g: number, b: number;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// ============================================================================
// Color String Parsing
// ============================================================================

/**
 * CSS 색상 문자열 파싱 (rgb, rgba, hsl, hsla, hex)
 */
export function parseColor(colorString: string): IRGBA | null {
  // HEX 형식
  if (colorString.startsWith('#')) {
    const rgb = hexToRgb(colorString);
    return rgb ? { ...rgb, a: 1 } : null;
  }
  
  // RGB/RGBA 형식
  const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
    };
  }
  
  // HSL/HSLA 형식
  const hslMatch = colorString.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
  if (hslMatch) {
    const rgb = hslToRgb(
      parseInt(hslMatch[1]),
      parseInt(hslMatch[2]),
      parseInt(hslMatch[3])
    );
    return {
      ...rgb,
      a: hslMatch[4] ? parseFloat(hslMatch[4]) : 1,
    };
  }
  
  return null;
}

// ============================================================================
// Color Manipulation
// ============================================================================

/**
 * 색상 밝기 조절 (lighten)
 */
export function lighten(color: string, amount: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.min(100, hsl.l + amount);
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * 색상 어둡게 조절 (darken)
 */
export function darken(color: string, amount: number): string {
  return lighten(color, -amount);
}

/**
 * 색상 채도 조절
 */
export function saturate(color: string, amount: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.s = Math.max(0, Math.min(100, hsl.s + amount));
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * 색상 채도 감소 (desaturate)
 */
export function desaturate(color: string, amount: number): string {
  return saturate(color, -amount);
}

/**
 * 색상 투명도 조절
 */
export function fade(color: string, alpha: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;
  
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampedAlpha})`;
}

/**
 * 색상 반전
 */
export function invert(color: string): string {
  const rgb = parseColor(color);
  if (!rgb) return color;
  
  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
}

/**
 * 그레이스케일 변환
 */
export function grayscale(color: string): string {
  const rgb = parseColor(color);
  if (!rgb) return color;
  
  // Luminance 공식 사용
  const gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  return rgbToHex(gray, gray, gray);
}

// ============================================================================
// Color Mixing and Blending
// ============================================================================

/**
 * 두 색상 혼합 (선형 보간)
 */
export function mix(color1: string, color2: string, weight: number = 0.5): string {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  
  if (!rgb1 || !rgb2) return color1;
  
  const w = Math.max(0, Math.min(1, weight));
  const w1 = w;
  const w2 = 1 - w;
  
  return rgbToHex(
    Math.round(rgb1.r * w1 + rgb2.r * w2),
    Math.round(rgb1.g * w1 + rgb2.g * w2),
    Math.round(rgb1.b * w1 + rgb2.b * w2)
  );
}

/**
 * 색상 배열 생성 (그라데이션)
 */
export function generateGradient(
  startColor: string,
  endColor: string,
  steps: number
): string[] {
  const colors: string[] = [];
  
  for (let i = 0; i < steps; i++) {
    const weight = i / (steps - 1);
    colors.push(mix(startColor, endColor, weight));
  }
  
  return colors;
}

// ============================================================================
// Color Analysis
// ============================================================================

/**
 * 색상 밝기 계산 (perceived brightness)
 */
export function getBrightness(color: string): number {
  const rgb = parseColor(color);
  if (!rgb) return 0;
  
  // YIQ 공식 사용
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

/**
 * 색상이 밝은지 어두운지 판단
 */
export function isLight(color: string, threshold: number = 128): boolean {
  return getBrightness(color) > threshold;
}

/**
 * 색상이 어두운지 판단
 */
export function isDark(color: string, threshold: number = 128): boolean {
  return !isLight(color, threshold);
}

/**
 * 색상과 대비되는 텍스트 색상 반환 (흑백)
 */
export function getContrastColor(backgroundColor: string): string {
  return isLight(backgroundColor) ? '#000000' : '#FFFFFF';
}

/**
 * 두 색상 간 대비 비율 계산 (WCAG)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const getLuminance = (rgb: IRGB) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val /= 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================================
// Color Validation
// ============================================================================

/**
 * 유효한 HEX 색상인지 확인
 */
export function isValidHex(hex: string): boolean {
  return /^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(hex);
}

/**
 * 유효한 RGB 값인지 확인
 */
export function isValidRgb(r: number, g: number, b: number): boolean {
  return (
    Number.isInteger(r) && r >= 0 && r <= 255 &&
    Number.isInteger(g) && g >= 0 && g <= 255 &&
    Number.isInteger(b) && b >= 0 && b <= 255
  );
}

/**
 * 유효한 색상 문자열인지 확인
 */
export function isValidColor(color: string): boolean {
  const parsed = parseColor(color);
  return parsed !== null;
}

