'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface ConfettiTriggerProps {
  trigger: boolean;
  origin?: { x: number; y: number };
}

export function ConfettiTrigger({ trigger, origin }: ConfettiTriggerProps) {
  const prefersReduced = useReducedMotion();
  const prevTrigger = useRef(false);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    // Only fire when trigger flips from false to true
    if (trigger && !prevTrigger.current && !fired && !prefersReduced) {
      setFired(true);

      // Lightweight canvas-confetti alternative using CSS particles
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = origin ? `${origin.y}px` : '50%';
      container.style.left = origin ? `${origin.x}px` : '50%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '9999';
      document.body.appendChild(container);

      const colors = ['#F59E0B', '#2563EB', '#7C3AED', '#10B981', '#F43F5E'];

      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 8 + 4;
        const angle = Math.random() * 360;
        const velocity = Math.random() * 120 + 60;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        particle.style.transition = 'all 1s ease-out';
        particle.style.opacity = '1';

        container.appendChild(particle);

        requestAnimationFrame(() => {
          const rad = (angle * Math.PI) / 180;
          particle.style.transform = `translate(${Math.cos(rad) * velocity}px, ${Math.sin(rad) * velocity - 50}px) rotate(${Math.random() * 720}deg)`;
          particle.style.opacity = '0';
        });
      }

      setTimeout(() => {
        document.body.removeChild(container);
      }, 1200);
    }

    prevTrigger.current = trigger;
  }, [trigger, origin, fired, prefersReduced]);

  return null; // Purely side-effect component
}
