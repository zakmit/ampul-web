'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

// Dynamic import for heavy Three.js component (reduces initial bundle by ~500KB)
const BottleViewer = dynamic(() => import('@/components/home/BottleViewer'), {
  ssr: false,
  loading: () => (
    <div className="mx-auto w-full h-[61.8dvw] lg:h-[30.9dvw] lg:max-h-123.5 bg-gray-100 animate-pulse" />
  ),
});

interface BottleViewerWrapperProps {
  isMobile?: boolean;
}

export default function BottleViewerWrapper({ isMobile = false }: BottleViewerWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Start loading when user is 500px away from the section
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '500px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <BottleViewer isMobile={isMobile} />
      ) : (
        <div className={`mx-auto w-full ${isMobile ? "h-[61.8dvw]" : "h-[30.9dvw] max-h-123.5"} bg-gray-100 animate-pulse`} />
      )}
    </div>
  );
}
