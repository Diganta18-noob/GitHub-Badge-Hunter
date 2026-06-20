'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  animated?: boolean;
  height?: number;
}

export function ProgressBar({
  value,
  color = '#1f6f4a', // var(--accent-color)
  animated = true,
  height = 6,
}: ProgressBarProps) {
  const prefersReduced = useReducedMotion();
  const skipAnimation = prefersReduced || !animated;

  return (
    <div
      className="w-full overflow-hidden rounded-full bg-[var(--line)] border border-[#16211a]/20"
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={skipAnimation ? { width: `${value}%` } : { width: '0%' }}
        animate={{ width: `${value}%` }}
        transition={
          skipAnimation
            ? { duration: 0 }
            : { duration: 0.6, ease: 'easeOut' }
        }
      />
    </div>
  );
}
