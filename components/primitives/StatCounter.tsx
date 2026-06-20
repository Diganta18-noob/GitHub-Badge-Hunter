'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { formatNumber } from '@/lib/utils/formatters';
import { counterFade } from '@/lib/utils/animation-variants';

interface StatCounterProps {
  value: number;
  label: string;
  duration?: number;
  format?: (n: number) => string;
}

export function StatCounter({
  value,
  label,
  duration = 800,
  format,
}: StatCounterProps) {
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(prefersReduced ? value : 0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }

    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (value - startValue) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, prefersReduced]);

  const formatted = format ? format(displayValue) : formatNumber(displayValue);

  return (
    <motion.div
      className="flex flex-col items-center gap-1 border border-[#16211a] bg-white p-3 rounded-[6px] shadow-[0_2px_0_#16211a]"
      variants={counterFade}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <span className="text-2xl font-extrabold tabular-nums text-[#16211a] font-mono">
        {formatted}
      </span>
      <span className="text-xs text-[#4f6156] font-bold">{label}</span>
    </motion.div>
  );
}
