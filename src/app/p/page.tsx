'use client';

import { useState } from 'react';
import ProductOverviewClient from '@/components/ProductOverviewClient';
import { Product } from '@/components/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { FilterSection } from '@/components/ProductFilters';

// Mock products data - in production, this would be fetched from a database or API
const products: Product[] = [
  {
    id: '1',
    name: 'Icarus',
    quote: '"His desire for a brilliant, burning dream melts his wings of survival."',
    price: 200,
    volume: '100ml',
    image: '/products/icare-bottle.jpg',
    slug: 'icare',
  },
  {
    id: '2',
    name: 'Narcissus',
    quote: '"His love, to a beautiful illusion which never exist, makes him lost his mind"',
    price: 200,
    volume: '100ml',
    image: '/products/narcisse-bottle.jpg',
    slug: 'narcisse',
  },
  {
    id: '3',
    name: 'Cassandre',
    quote: '"For those awake among the numb, compelled to cry out."',
    price: 200,
    volume: '100ml',
    image: '/products/cassandre-bottle.jpg',
    slug: 'cassandre',
  },
  {
    id: '4',
    name: 'Antigone',
    quote: '"Her loyalty to family brings her to the edge of life and death."',
    price: 200,
    volume: '100ml',
    image: '/products/antigone-bottle.jpg',
    slug: 'antigone',
  },
];

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState('default');
  const [volumeFilter, setVolumeFilter] = useState<string[]>([]);
  const [collectionFilter, setCollectionFilter] = useState<string[]>([]);
  const [fragranceNotesFilter, setFragranceNotesFilter] = useState<string[]>([]);

  // Define filter sections for this page
  const filterSections: FilterSection[] = [
    {
      id: 'sort',
      title: 'Sort By',
      type: 'radio',
      options: [
        { id: 'default', label: 'Default' },
        { id: 'name-asc', label: 'Name A-Z' },
        { id: 'name-desc', label: 'Name Z-A' },
        { id: 'price-asc', label: 'Price from low to high' },
        { id: 'price-desc', label: 'Price from high to low' },
      ],
      value: sortBy,
      onChange: (value) => setSortBy(value as string),
    },
    {
      id: 'volume',
      title: 'Volume',
      type: 'checkbox',
      options: [
        { id: '100ml', label: '100 ml' },
      ],
      value: volumeFilter,
      onChange: (value) => setVolumeFilter(value as string[]),
    },
    {
      id: 'collection',
      title: 'Collection',
      type: 'checkbox',
      options: [
        { id: 'greek-mythology', label: 'Greek Mythology' },
      ],
      value: collectionFilter,
      onChange: (value) => setCollectionFilter(value as string[]),
    },
    {
      id: 'fragrance-notes',
      title: 'Fragrance Notes',
      type: 'checkbox',
      options: [
        { id: 'citrus', label: 'Citrus' },
        { id: 'floral', label: 'Floral' },
        { id: 'leather', label: 'Leather' },
      ],
      value: fragranceNotesFilter,
      onChange: (value) => setFragranceNotesFilter(value as string[]),
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Header Section */}
      <div className="px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 border-b">
        <h1 className="text-4xl lg:text-5xl font-bold text-center mb-4">
          Greek Mythology Collection
        </h1>
        <p className="text-center italic text-gray-700 max-w-3xl mx-auto">
          Inspired by the most famous tragedies, how did they come to this? What&apos;s the decisive moment in their destiny?
        </p>
      </div>

      {/* Client Component with Filter State */}
      <ProductOverviewClient products={products} filterSections={filterSections} />
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { href: '/', label: 'Home' },
          { label: 'Fragrances' },
        ]}
      />
    </div>
  );
}
