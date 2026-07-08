'use client';

import React from 'react';

export interface ScoreDialProps {
  /** Score value, 0–100 */
  value: number;
  /** Outer size in pixels (default 72) */
  size?: number;
  /** Optional eyebrow-style label rendered under the dial */
  label?: string;
  /** Optional grade text rendered under the number inside the dial */
  grade?: string;
  className?: string;
}

/**
 * Semantic score colors, used consistently everywhere a score appears:
 * strong >= 70 -> spring neon, mid 40-69 -> amber, weak < 40 -> hot red.
 */
export function scoreTone(value: number): 'strong' | 'mid' | 'weak' {
  if (value >= 70) return 'strong';
  if (value >= 40) return 'mid';
  return 'weak';
}

export function scoreTextClass(value: number): string {
  const tone = scoreTone(value);
  if (tone === 'strong') return 'text-[#0D9488] dark:text-[#34F5C5]';
  if (tone === 'mid') return 'text-[#B45309] dark:text-[#FFB020]';
  return 'text-[#DC2626] dark:text-[#FF3B5C]';
}

export function scoreBarClass(value: number): string {
  const tone = scoreTone(value);
  if (tone === 'strong') return 'bg-[#0D9488] dark:bg-[#34F5C5]';
  if (tone === 'mid') return 'bg-[#B45309] dark:bg-[#FFB020]';
  return 'bg-[#DC2626] dark:bg-[#FF3B5C]';
}

const STROKE_LIGHT: Record<string, string> = {
  strong: '#0D9488',
  mid: '#B45309',
  weak: '#DC2626',
};

const STROKE_DARK: Record<string, string> = {
  strong: '#34F5C5',
  mid: '#FFB020',
  weak: '#FF3B5C',
};

const GLOW_DARK: Record<string, string> = {
  strong: 'rgba(52, 245, 197, 0.55)',
  mid: 'rgba(255, 176, 32, 0.55)',
  weak: 'rgba(255, 59, 92, 0.55)',
};

/**
 * ScoreDial — the signature element of the HUD identity.
 * An SVG arc showing 0-100 in semantic neon, number set in Chakra Petch.
 * Dark mode adds a soft glow behind the arc; strong scores glow harder.
 */
export default function ScoreDial({ value, size = 72, label, grade, className = '' }: ScoreDialProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const tone = scoreTone(clamped);
  const strokeWidth = Math.max(3, Math.round(size / 18));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;
  const numberSize = Math.round(size * (grade ? 0.26 : 0.3));

  return (
    <div className={`inline-flex flex-col items-center gap-1.5 ${className}`}>
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${label ? label + ': ' : ''}score ${clamped} out of 100`}
      >
        {/* Track + light-mode arc (daylight terminal: no glow) */}
        <svg width={size} height={size} className="-rotate-90 dark:hidden" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#D8E0EC"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={STROKE_LIGHT[tone]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            style={{ transition: 'stroke-dasharray 0.4s ease' }}
          />
        </svg>
        {/* Dark-mode arc — neon value arc over a steel track, soft blurred halo */}
        <svg width={size} height={size} className="-rotate-90 hidden dark:block" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1B2A4A"
            strokeWidth={strokeWidth}
          />
          {/* Duplicate blurred arc at low opacity = restrained neon glow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={GLOW_DARK[tone]}
            strokeWidth={strokeWidth * 2}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            style={{ filter: 'blur(4px)', transition: 'stroke-dasharray 0.4s ease' }}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={STROKE_DARK[tone]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            style={{ transition: 'stroke-dasharray 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-display font-bold leading-none ${scoreTextClass(clamped)} ${
              tone === 'strong' ? 'dark:[text-shadow:0_0_12px_rgba(52,245,197,0.55)]' : ''
            }`}
            style={{ fontSize: numberSize }}
          >
            {clamped}
          </span>
          {grade && (
            <span
              className="font-data uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400 mt-0.5"
              style={{ fontSize: Math.max(8, Math.round(size * 0.11)) }}
            >
              {grade}
            </span>
          )}
        </div>
      </div>
      {label && <span className="eyebrow text-center">{label}</span>}
    </div>
  );
}
