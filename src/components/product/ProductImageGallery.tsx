'use client';

import { useState, useRef, TouchEvent } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swiped left - next image
      nextImage();
    }

    if (touchEndX.current - touchStartX.current > 50) {
      // Swiped right - previous image
      previousImage();
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Desktop Navigation Buttons */}
      <button
        onClick={previousImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-gray-100/10 hover:bg-gray-100/60 shadow-lg transition-all"
        aria-label="Previous image"
      >
        <ChevronLeft strokeWidth="1" className="w-8 h-8 mx-auto text-gray-900" />
      </button>

      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-gray-100/10 hover:bg-gray-100/60 shadow-lg transition-all"
        aria-label="Next image"
      >
        <ChevronRight strokeWidth="1" className="w-8 h-8 mx-auto text-gray-900" />
      </button>

      {/* Product Image with Swipe Support */}
      <div
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[currentImageIndex]}
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 65vw"
          className="object-cover"
          priority={currentImageIndex === 0}
        />
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-all cursor-pointer hover:bg-gray-700 ${
              index === currentImageIndex ? 'bg-gray-900' : 'bg-gray-400'
            }`}
            aria-label={`View image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
