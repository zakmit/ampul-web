'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import ScrollSection from './ScrollSection';

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

export default function MobileCharacterSections({
  characters,
  locale,
  checkDetailText
}: MobileCharacterSectionsProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress within the character sections container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Update active section and visibility based on scroll progress
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    // Show indicator when sections are in viewport (progress between 0.1 and 0.9)
    setIsVisible(latest > 0.1 && latest < 0.9);

    // Divide the scroll progress into 4 equal sections
    const section = Math.min(Math.floor(latest * 4), 3);
    setActiveSection(section);
  });

  return (
    <div ref={containerRef} className="bg-olive-700 text-center relative">
      {/* Cassandre */}
      <ScrollSection
        className="h-dvh content-center"
        enableSticky={true}
      >
        <div className="w-full h-full text-gold">
          {/* Image positioned from right */}
          <div className="absolute h-dvh left-40 w-[84.2dvh]" style={{ filter: 'drop-shadow(0 4px 4px oklch(0.2743 0.028 140.74))' }}>
            <Image
              src={characters[0].image}
              alt={characters[0].title}
              fill
              className="object-cover"
            />
          </div>

          {/* Text content - left aligned */}
          <div className="h-full">
            <h2 className="absolute top-24 text-lg font-bold w-60 italic left-7">{characters[0].quote}</h2>
            <div className='absolute top-3/5 left-4 -translate-y-1/2 w-40 flex flex-col items-center'>
              <span className="font-title italic text-sm w-40 mb-4">{characters[0].description}</span>
              <Link
                href={`/${locale}/p/${characters[0].slug}`}
                className="inline-block border border-gold text-gold hover:bg-gold hover:text-olive-700 px-6 py-2 text-sm transition-colors"
              >
                {checkDetailText}
              </Link>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* Narcisse */}
      <ScrollSection
        className="h-dvh content-center"
        enableSticky={true}
      >
        <div className="w-full h-full text-gold">
          {/* Image positioned from left */}
          <div className="absolute h-dvh right-20 w-[84.2dvh]" style={{ filter: 'drop-shadow(0 4px 4px oklch(0.2743 0.028 140.74))' }}>
            <Image
              src={characters[1].image}
              alt={characters[1].title}
              fill
              className="object-cover"
            />
          </div>

          {/* Text content - right aligned */}
          <div className="h-full">
            <h2 className="absolute top-24 text-lg font-bold w-50 italic right-1">{characters[1].quote}</h2>
            <div className='absolute top-1/2 right-4 w-40 flex flex-col items-center'>
              <span className="font-title italic text-sm w-40 mb-4">{characters[1].description}</span>
              <Link
                href={`/${locale}/p/${characters[1].slug}`}
                className="inline-block border border-gold text-gold hover:bg-gold hover:text-olive-700 px-6 py-2 text-sm transition-colors"
              >
                {checkDetailText}
              </Link>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* Icarus */}
      <ScrollSection
        className="h-dvh content-center"
        enableSticky={true}
      >
        <div className="w-full h-full text-gold">
          {/* Image positioned from right */}
          <div className="absolute h-dvh left-34 w-[84.2dvh]" style={{ filter: 'drop-shadow(0 4px 4px oklch(0.2743 0.028 140.74))' }}>
            <Image
              src={characters[2].image}
              alt={characters[2].title}
              fill
              className="object-cover"
            />
          </div>

          {/* Text content - left aligned */}
          <div className="h-full">
            <h2 className="absolute top-20 text-lg font-bold w-55 italic left-0">{characters[2].quote}</h2>
            <div className='absolute top-2/3 left-2 -translate-y-1/2 w-40 flex flex-col items-center'>
              <span className="font-title italic text-sm w-40 mb-4">{characters[2].description}</span>
              <Link
                href={`/${locale}/p/${characters[2].slug}`}
                className="inline-block border border-gold text-gold hover:bg-gold hover:text-olive-700 px-6 py-2 text-sm transition-colors"
              >
                {checkDetailText}
              </Link>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* Antigone */}
      <ScrollSection
        className="h-dvh content-center"
        enableSticky={true}
      >
        <div className="w-full h-full text-gold">
          {/* Image positioned from left */}
          <div className="absolute h-dvh right-6 w-[84.2dvh]" style={{ filter: 'drop-shadow(0 4px 4px oklch(0.2743 0.028 140.74))' }}>
            <Image
              src={characters[3].image}
              alt={characters[3].title}
              fill
              className="object-cover"
            />
          </div>

          {/* Text content - right aligned */}
          <div className="h-full">
            <h2 className="absolute top-24 text-lg font-bold w-60 italic right-1">{characters[3].quote}</h2>
            <div className='absolute top-1/3 right-1 w-40 flex flex-col items-center'>
              <span className="font-title italic text-sm w-40 mb-4">{characters[3].description}</span>
              <Link
                href={`/${locale}/p/${characters[3].slug}`}
                className="inline-block border border-gold text-gold hover:bg-gold hover:text-olive-700 px-6 py-2 text-sm transition-colors"
              >
                {checkDetailText}
              </Link>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* Single Progress Indicator - Fixed at bottom */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10 lg:hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : 20
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            className="h-1.5 rounded-full"
            initial={false}
            animate={{
              width: index === activeSection ? 32 : 8,
              backgroundColor: index === activeSection ? 'oklch(0.8693 0.0153 94.22)' : 'oklch(0.2743 0.028 140.74)'
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
    </div>
  );
}
