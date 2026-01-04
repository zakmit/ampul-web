'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlide {
  image: string;
  alt: string;
  title?: string;
  description?: string;
  textColor?: 'dark' | 'light';
  link?: string;
}

interface HeroCarouselMobileProps {
  slides: HeroSlide[];
  autoPlayInterval?: number;
}

export default function HeroCarouselMobile({ slides, autoPlayInterval = 5000 }: HeroCarouselMobileProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [slides.length, autoPlayInterval, timerKey]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setTimerKey((prev) => prev + 1); // Reset timer
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimerKey((prev) => prev + 1); // Reset timer
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimerKey((prev) => prev + 1); // Reset timer
  };

  return (
    <div className="relative w-full border-b border-gray-900">
      {slides[currentSlide].link ? (
        <Link href={slides[currentSlide].link!} className="block ">
          {/* Image Section */}
          <div className="relative w-dvw h-[56.25dvw]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <Image
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].alt}
                  fill
                  className="object-cover object-center"
                  priority={currentSlide === 0}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Text Content Section */}
          <div className="bg-white px-6 pt-4 pb-6 h-37">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center text-gray-900"
              >
                {slides[currentSlide].title && (
                  <h1 className="text-xl font-bold mb-2 mx-4">
                    {slides[currentSlide].title}
                  </h1>
                )}
                {slides[currentSlide].description && (
                  <p className="text-sm italic mx-1 leading-relaxed">
                    {slides[currentSlide].description}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Link>
      ) : (
        <>
          {/* Image Section */}
          <div className="relative w-dvw h-[56.25dvw]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <Image
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].alt}
                  fill
                  className="object-cover object-center"
                  priority={currentSlide === 0}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Text Content Section */}
          <div className="bg-white px-6 pt-4 pb-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center text-gray-900"
              >
                {slides[currentSlide].title && (
                  <h1 className="text-xl font-bold mb-2 mx-4">
                    {slides[currentSlide].title}
                  </h1>
                )}
                {slides[currentSlide].description && (
                  <p className="text-sm italic mx-1 leading-relaxed">
                    {slides[currentSlide].description}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Navigation Arrows - Centered in text section */}
      <button
        onClick={prevSlide}
        className="absolute left-0 bottom-0 top-[56.25dvw] translate-y-15 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100/60 transition-all z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft strokeWidth="1" className="w-8 h-8 mx-auto text-gray-900" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 bottom-0 top-[56.25dvw] translate-y-15 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100/60 transition-all z-10"
        aria-label="Next slide"
      >
        <ChevronRight strokeWidth="1.5" className="w-8 h-8 mx-auto text-gray-900" />
      </button>

      {/* Dots Indicator - At the bottom */}
      <div className="absolute bottom-0 left-0 right-0 pb-2">
        <div className="flex gap-2 justify-center mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-gray-900 w-6'
                  : 'bg-gray-400 hover:bg-gray-600'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
