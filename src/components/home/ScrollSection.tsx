'use client';

import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollSectionProps {
  children: ReactNode;
  className?: string;
  enableSticky?: boolean;
}

export default function ScrollSection({
  children,
  className = '',
  enableSticky = false
}: ScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.45, 0.5, 0.55, 0.7, 1],
    [0, 0.6, 1, 1, 1, 0.6, 0]
  );

  return (
    <div
      ref={ref}
      className={className}
      style={enableSticky ? { height: '200vh' } : undefined}
    >
      <motion.div
        style={{ opacity }}
        className="h-dvh sticky top-0 flex items-center justify-center"
      >
        {children}
      </motion.div>
    </div>
  );
}
