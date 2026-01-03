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

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoPlayInterval?: number;
}

export default function HeroCarousel({ slides, autoPlayInterval = 10000 }: HeroCarouselProps) {
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
    <div className="relative w-full h-full">
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

      {/* Text Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="mb-8 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {slides[currentSlide].link ? (
              <Link
                href={slides[currentSlide].link!}
                className={`block pointer-events-auto ${
                  slides[currentSlide].textColor === 'light' ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                {slides[currentSlide].title && (
                  <h1 className="text-5xl font-bold mb-4">
                    {slides[currentSlide].title}
                  </h1>
                )}
                {slides[currentSlide].description && (
                  <p className="text-xl italic mx-auto max-w-3xl">
                    {slides[currentSlide].description}
                  </p>
                )}
              </Link>
            ) : (
              <div className={slides[currentSlide].textColor === 'light' ? 'text-gray-100' : 'text-gray-900'}>
                {slides[currentSlide].title && (
                  <h1 className="text-5xl font-bold mb-4">
                    {slides[currentSlide].title}
                  </h1>
                )}
                {slides[currentSlide].description && (
                  <p className="text-xl italic mx-auto max-w-3xl">
                    {slides[currentSlide].description}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-gray-100/10 hover:bg-gray-100/60 shadow-lg transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft strokeWidth="1" className="w-8 h-8 mx-auto text-gray-900" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-gray-100/10 hover:bg-gray-100/60 shadow-lg transition-all"
        aria-label="Next slide"
      >
        <ChevronRight strokeWidth="1" className="w-8 h-8 mx-auto text-gray-900" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-gray-900 w-6'
                : 'bg-gray-400 hover:bg-gray-700'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
