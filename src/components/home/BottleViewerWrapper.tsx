'use client';

import dynamic from 'next/dynamic';

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
  return <BottleViewer isMobile={isMobile} />;
}
