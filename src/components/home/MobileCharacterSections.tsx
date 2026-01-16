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

interface MobileCharacterSectionsProps {
  characters: Character[];
  locale: string;
  checkDetailText: string;
}

// Character section content configurations
const sectionConfigs = [
  {
    imagePosition: 'right', // Image on right, text on left
    imageClass: 'left-40 md:right-0 md:left-auto',
    quoteClass: 'left-7 md:right-[66dvh] md:left-auto',
    quoteTop: 'top-24',
    quoteWidth: 'w-60',
    descClass: 'top-3/5 left-4 -translate-y-1/2 md:right-[75dvh] md:left-auto',
  },
  {
    imagePosition: 'left', // Image on left, text on right
    imageClass: 'right-20 sm:left-0 sm:right-auto',
    quoteClass: 'right-1 md:left-[70dvh] md:right-auto',
    quoteTop: 'top-24',
    quoteWidth: 'w-50',
    descClass: 'top-1/2 right-4 md:left-[75dvh] md:right-auto',
  },
  {
    imagePosition: 'right',
    imageClass: 'left-34 md:right-0 md:left-auto',
    quoteClass: 'left-0 md:right-[68dvh] md:left-auto',
    quoteTop: 'top-20',
    quoteWidth: 'w-55',
    descClass: 'top-2/3 left-2 -translate-y-1/2 md:right-[73dvh] md:left-auto',
  },
  {
    imagePosition: 'left',
    imageClass: 'right-6 sm:left-0 sm:right-auto',
    quoteClass: 'right-1 md:left-[64dvh] md:right-auto',
    quoteTop: 'top-24',
    quoteWidth: 'w-60',
    descClass: 'top-1/3 right-1 md:left-[74dvh] md:right-auto',
  },
];

export default function MobileCharacterSections({
  characters,
  locale,
  checkDetailText
}: MobileCharacterSectionsProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [sectionProgress, setSectionProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Individual refs for each section
  const section0Ref = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const sectionRefs = [section0Ref, section1Ref, section2Ref, section3Ref];

  // Track scroll progress within the character sections container for visibility
  const { scrollYProgress: containerProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Track each section's scroll progress for the progress bar
  // offset: ['start start', 'end end'] means:
  // - progress = 0 when section top reaches viewport top
  // - progress = 1 when section bottom reaches viewport bottom
  const { scrollYProgress: section0Progress } = useScroll({
    target: section0Ref,
    offset: ['start start', 'end end']
  });
  const { scrollYProgress: section1Progress } = useScroll({
    target: section1Ref,
    offset: ['start start', 'end end']
  });
  const { scrollYProgress: section2Progress } = useScroll({
    target: section2Ref,
    offset: ['start start', 'end end']
  });
  const { scrollYProgress: section3Progress } = useScroll({
    target: section3Ref,
    offset: ['start start', 'end end']
  });

  // Track scroll for fade in/out effect (uses full scroll range including gaps)
  const { scrollYProgress: section0Fade } = useScroll({
    target: section0Ref,
    offset: ['start end', 'end start']
  });
  const { scrollYProgress: section1Fade } = useScroll({
    target: section1Ref,
    offset: ['start end', 'end start']
  });
  const { scrollYProgress: section2Fade } = useScroll({
    target: section2Ref,
    offset: ['start end', 'end start']
  });
  const { scrollYProgress: section3Fade } = useScroll({
    target: section3Ref,
    offset: ['start end', 'end start']
  });

  // Opacity transforms for fade in/out
  const section0Opacity = useTransform(section0Fade, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 1, 1, 1, 1, 0]);
  const section1Opacity = useTransform(section1Fade, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 1, 1, 1, 1, 0]);
  const section2Opacity = useTransform(section2Fade, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 1, 1, 1, 1, 0]);
  const section3Opacity = useTransform(section3Fade, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 1, 1, 1, 1, 0]);
  const sectionOpacities = [section0Opacity, section1Opacity, section2Opacity, section3Opacity];

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

  // Track section 2 progress
  useMotionValueEvent(section2Progress, 'change', (progress) => {
    if (progress > 0 && progress < 1) {
      setActiveSection(2);
      setSectionProgress(progress);
    }
  });

  // Track section 3 progress
  useMotionValueEvent(section3Progress, 'change', (progress) => {
    if (progress > 0 && progress < 1) {
      setActiveSection(3);
      setSectionProgress(progress);
    }
  });

  return (
    <div ref={containerRef} className="bg-olive-700 text-center relative">
      {/* Initial gap for fade-in */}
      <div style={{ height: '50dvh' }} />

      {characters.slice(0, 4).map((character, index) => {
        const config = sectionConfigs[index];
        return (
          <div key={character.slug}>
            <div
              ref={sectionRefs[index]}
              style={{ height: '200vh' }} // Extra height for scroll progress
            >
              {/* Sticky content - sticks at top of viewport */}
              <m.div
                className="sticky top-0 h-dvh w-full text-gold overflow-hidden"
                style={{ opacity: sectionOpacities[index] }}
              >
              {/* Image */}
              <div
                className={`absolute h-dvh ${config.imageClass} w-[84.2dvh] overflow-hidden`}
                style={{ filter: 'drop-shadow(0 4px 4px oklch(0.2743 0.028 140.74))' }}
              >
                <Image
                  src={character.image}
                  alt={character.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Text content */}
              <div className="h-full">
                <h2 className={`absolute ${config.quoteTop} text-lg font-bold ${config.quoteWidth} italic ${config.quoteClass}`}>
                  {character.quote}
                </h2>
                <div className={`absolute ${config.descClass} w-40 flex flex-col items-center`}>
                  <span className="font-title italic text-sm w-40 mb-4">{character.description}</span>
                  <Link
                    href={`/${locale}/p/${character.slug}`}
                    className="inline-block border border-gold text-gold hover:bg-gold hover:text-olive-700 px-6 py-2 text-sm transition-colors"
                  >
                    {checkDetailText}
                  </Link>
                </div>
              </div>
              </m.div>
            </div>
            {/* Gap between sections for fade transition */}
            <div style={{ height: '50dvh' }} />
          </div>
        );
      })}

      {/* Single Progress Indicator - Fixed at bottom */}
      <m.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10 lg:hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : 20
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
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
