'use client';

import { useState, useRef } from 'react';
import { m, useScroll, useMotionValueEvent, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface Character {
  slug: string;
  title: string;
  quote: string;
  description: string;
  image: string;
  productImage: string;
  price?: number;
  volume?: string;
}

interface DesktopCharacterSectionsProps {
  characters: Character[];
  locale: string;
  checkDetailText: string;
}

export default function DesktopCharacterSections({
  characters,
  locale,
  checkDetailText
}: DesktopCharacterSectionsProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [sectionProgress, setSectionProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for each paired section
  const section0Ref = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);

  // Track scroll progress within the character sections container for visibility
  const { scrollYProgress: containerProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Track each section's scroll progress for the progress bar
  const { scrollYProgress: section0Progress } = useScroll({
    target: section0Ref,
    offset: ['start start', 'end end']
  });
  const { scrollYProgress: section1Progress } = useScroll({
    target: section1Ref,
    offset: ['start start', 'end end']
  });

  // Track scroll for fade in/out effect
  const { scrollYProgress: section0Fade } = useScroll({
    target: section0Ref,
    offset: ['start end', 'end start']
  });
  const { scrollYProgress: section1Fade } = useScroll({
    target: section1Ref,
    offset: ['start end', 'end start']
  });

  // Opacity transforms for fade in/out
  const section0Opacity = useTransform(section0Fade, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 1, 1, 1, 1, 0]);
  const section1Opacity = useTransform(section1Fade, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 1, 1, 1, 1, 0]);
  const sectionOpacities = [section0Opacity, section1Opacity];

  // Update visibility based on container scroll
  useMotionValueEvent(containerProgress, 'change', (latest) => {
    setIsVisible(latest > 0.02 && latest < 0.98);
  });

  // Track section 0 progress
  useMotionValueEvent(section0Progress, 'change', (progress) => {
    if (progress > 0 && progress < 1) {
      setActiveSection(0);
      setSectionProgress(progress);
    }
  });

  // Track section 1 progress
  useMotionValueEvent(section1Progress, 'change', (progress) => {
    if (progress > 0 && progress < 1) {
      setActiveSection(1);
      setSectionProgress(progress);
    }
  });

  return (
    <div ref={containerRef} className="bg-olive-700 text-center relative">
      {/* Initial gap for fade-in */}
      <div style={{ height: '50dvh' }} />

      {/* Cassandre (Right) & Narcisse (Left) */}
      <div>
        <div
          ref={section0Ref}
          style={{ height: '300vh' }}
        >
          <m.div
            className="sticky top-0 h-dvh w-full text-gold overflow-hidden"
            style={{ opacity: sectionOpacities[0] }}
          >
            {/* Background Images */}
            <div className="absolute h-dvh w-[84.2dvh] left-3/5" style={{ filter: 'drop-shadow(0 4px 4px oklch(0.2743 0.028 140.74))' }}>
              <Image
                src={characters[0].image}
                alt={characters[0].title}
                sizes="70vw"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute h-dvh w-[84.2dvh] right-3/5" style={{ filter: 'drop-shadow(0 4px 4px oklch(0.2743 0.028 140.74))' }}>
              <Image
                src={characters[1].image}
                alt={characters[1].title}
                sizes="70vw"
                fill
                className="object-cover"
              />
            </div>

            <div className="h-full">
              {/* Cassandre - Right */}
              <div>
                <h2 className="absolute left-6/11 top-4 text-2xl italic w-75">{characters[0].quote}</h2>
                <div className="absolute left-5/11 translate-x-1/5 top-28 w-50 flex flex-col items-center">
                  <span className="text-base font-title italic mb-4">{characters[0].description}</span>
                  <Link
                    href={`/${locale}/p/${characters[0].slug}`}
                    className="inline-block border border-gold text-gold hover:bg-gold hover:text-olive-700 px-6 py-2 text-sm transition-colors"
                  >
                    {checkDetailText}
                  </Link>
                </div>
              </div>

              {/* Narcisse - Left */}
              <div>
                <h2 className="absolute left-1/3 top-1/2 text-2xl italic w-75">{characters[1].quote}</h2>
                <div className="absolute left-2/5 translate-x-6 top-3/5 translate-y-6 w-53 flex flex-col items-center">
                  <span className="text-base font-title italic mb-4">{characters[1].description}</span>
                  <Link
                    href={`/${locale}/p/${characters[1].slug}`}
                    className="inline-block border border-gold text-gold hover:bg-gold hover:text-olive-700 px-6 py-2 text-sm transition-colors"
                  >
                    {checkDetailText}
                  </Link>
                </div>
              </div>
            </div>
          </m.div>
        </div>
        {/* Gap between sections */}
        <div style={{ height: '50dvh' }} />
      </div>

      {/* Icarus (Right) & Antigone (Left) */}
      <div>
        <div
          ref={section1Ref}
          style={{ height: '300vh' }}
        >
          <m.div
            className="sticky top-0 h-dvh w-full text-gold overflow-hidden"
            style={{ opacity: sectionOpacities[1] }}
          >
            {/* Background Images */}
            <div className="absolute h-dvh w-[84.2dvh] left-3/5" style={{ filter: 'drop-shadow(0 4px 4px oklch(0.2743 0.028 140.74))' }}>
              <Image
                src={characters[2].image}
                alt={characters[2].title}
                sizes="70vw"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute h-dvh w-[84.2dvh] right-3/5" style={{ filter: 'drop-shadow(0 4px 4px oklch(0.2743 0.028 140.74))' }}>
              <Image
                src={characters[3].image}
                alt={characters[3].title}
                sizes="70vw"
                fill
                className="object-cover"
              />
            </div>

            <div className="relative h-full max-w-7xl mx-auto">
              {/* Icarus - Right */}
              <div>
                <h2 className="absolute left-3/11 translate-x-1/6 top-12 text-2xl italic w-75">{characters[2].quote}</h2>
                <div className="absolute left-3/11 translate-x-30 top-40 w-60 flex flex-col items-center">
                  <span className="text-base font-title italic mb-4">{characters[2].description}</span>
                  <Link
                    href={`/${locale}/p/${characters[2].slug}`}
                    className="inline-block border border-gold text-gold hover:bg-gold hover:text-olive-700 px-6 py-2 text-sm transition-colors"
                  >
                    {checkDetailText}
                  </Link>
                </div>
              </div>

              {/* Antigone - Left */}
              <div>
                <h2 className="absolute left-3/11 translate-x-34 top-4/7 text-2xl italic w-54">{characters[3].quote}</h2>
                <div className="absolute left-5/11 top-5/7 w-53 flex flex-col items-center">
                  <span className="text-base font-title italic mb-4">{characters[3].description}</span>
                  <Link
                    href={`/${locale}/p/${characters[3].slug}`}
                    className="inline-block border border-gold text-gold hover:bg-gold hover:text-olive-700 px-6 py-2 text-sm transition-colors"
                  >
                    {checkDetailText}
                  </Link>
                </div>
              </div>
            </div>
          </m.div>
        </div>
        {/* Gap after last section */}
        <div style={{ height: '50dvh' }} />
      </div>

      {/* Progress Indicator - Fixed at bottom */}
      <m.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : 20
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {Array.from({ length: 2 }).map((_, index) => (
          <m.div
            key={index}
            className="h-1.5 rounded-full overflow-hidden relative"
            initial={false}
            animate={{
              width: index === activeSection ? 32 : 8
            }}
            style={{
              backgroundColor: 'oklch(0.2743 0.028 140.74)'
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Progress fill */}
            <m.div
              className="absolute inset-0 rounded-full origin-left"
              style={{
                backgroundColor: 'oklch(0.8693 0.0153 94.22)'
              }}
              initial={false}
              animate={{
                scaleX: index < activeSection ? 1 : index === activeSection ? sectionProgress : 0
              }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </m.div>
        ))}
      </m.div>
    </div>
  );
}
