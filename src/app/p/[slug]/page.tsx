'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Mock data - replace with actual data fetching based on params.slug
  const product = {
    name: 'Icarus',
    subtitle: 'Eau de Toilette',
    quote: '"His desire for a brilliant, burning dream melts his wings of survival."',
    volume: '100ml · 3.4 fl oz',
    price: 200,
    sensations: 'Sea water choked in the nose, Cinnamon and amber bring the warmness of burning sun, Melting wax flowing on the skin',
    images: [
      '/products/icare-0.jpg',
      '/products/icare-1.jpg',
      '/products/icare-2.jpg',
      '/products/icare-3.jpg',
    ],
  };
  const collection = {
    product: ['Cassandre', 'Narcisse', 'Icare'],
    images: [
      '/products/cassandre-1.jpg',
      '/products/narcisse-1.jpg',
      '/products/icare-1.jpg',
    ],
  }
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const infoSections = [
    {
      id: 'delivery',
      title: 'Delivery',
      content: 'Delivery information will be displayed here.',
    },
    {
      id: 'returns',
      title: 'Free Returns',
      content: 'Free returns information will be displayed here.',
    },
    {
      id: 'refill',
      title: 'Refill Bottle',
      content: 'Refill bottle information will be displayed here.',
    },
  ];

  const relatedProducts = [
    {
      name: 'Cassandra',
      subtitle: 'Eau de Toilette',
      image: '/products/cassandre-1.jpg',
      slug: 'cassandre',
    },
    {
      name: 'Narcisse',
      subtitle: 'Eau de Toilette',
      image: '/products/narcisse-1.jpg',
      slug: 'narcisse',
    },
    {
      name: 'Icarus',
      subtitle: 'Eau de Toilette',
      image: '/products/icare-1.jpg',
      slug: 'icare',
    },
  ];

  return (
    <div>
      {/* Product Image Section */}
      <div className="relative w-dvw h-dvw flex items-center justify-center -z-10">
        <div className="w-full max-w-md h-full flex items-center justify-center">
          {/* Product image */}
            <Image
              src={product.images[currentImageIndex]}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              fill
              className="object-contain"
              priority={currentImageIndex === 0}
            />
        </div>

        {/* Image indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-5">
          {product.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-gray-900' : 'bg-gray-600'
              }`}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Product Details Section */}
      <div className="bg-white">
        <div className="max-w-md mx-auto px-6 pt-2 pb-8">
          {/* Product Title */}
          <h1 className={`text-4xl font-bold text-center`}>{product.name}</h1>
          <p className="text-center text-xs mb-2">{product.subtitle}</p>

          {/* Quote */}
          <h3 className="text-center italic font-light mb-2 leading-relaxed">
            {product.quote}
          </h3>

          {/* Volume and Add to Bag */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-gray-700">{product.volume}</span>
            <button className="bg-gray-500 hover:bg-gray-800 text-gray-100 font-semibold px-5 py-3 rounded-md transition-colors">
              Add to bag · {product.price} $
            </button>
          </div>

          {/* Sensations */}
          <div className="mb-8 -mx-6 px-6 py-6 inset-shadow-[0_4px_4px_0] inset-shadow-gray-900/20 bg-gray-100">
            <h2 className="text-2xl italic font-bold text-center mb-1 mx-auto max-w-prose">Sensations</h2>
            <p className="text-center italic text-sm text-gray-700 leading-relaxed mx-auto max-w-prose">
              {product.sensations}
            </p>
          </div>

          {/* Expandable Sections */}
          <div>
            {infoSections.map((section) => {
              const isExpanded = expandedSection === section.id;
              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between py-4 no-underline hover:text-gray-500 hover:underline transition-colors ${
                      isExpanded ? 'border-transparent' : 'border-b border-gray-200'
                    }`}
                  >
                    <h3 className="text-xl font-bold italic">{section.title}</h3>
                    <ChevronRight
                      className={`transform transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="py-4 px-2 text-sm text-gray-600 border-b border-gray-200">
                      <p>{section.content}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Free Sample Note */}
          <p className="text-sm text-gray-500 mt-6 italic">
            *A free sample of your choice with every order
          </p>

          {/* Explore the Collection */}
          <div className="mt-6 -mx-6 px-6 pt-6 inset-shadow-[0_4px_4px_0] inset-shadow-gray-900/20 bg-gray-100">
            <h2 className="text-3xl italic font-bold text-center mb-8">
              Explore the Collection
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.slug}
                  href={`/p/${relatedProduct.slug}`}
                  className="group flex-shrink-0 w-48 snap-start"
                >
                  <div className="aspect-[1] relative rounded-sm overflow-hidden">
                    <Image
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-center font-bold text-lg">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-center text-xs">
                    {relatedProduct.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="mt-8 text-sm text-gray-600">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <Link href="/" className="hover:underline">Home</Link>
                </li>
                <li>&gt;</li>
                <li>
                  <a href="/fragrances" className="hover:underline">Fragrances</a>
                </li>
                <li>&gt;</li>
                <li>
                  <a href="/collection" className="hover:underline">Collection</a>
                </li>
                <li>&gt;</li>
                <li className="text-gray-900 font-medium">{product.name}</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
