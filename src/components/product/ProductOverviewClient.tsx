'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import ProductCard, { Product } from '@/components/product/ProductCard';
import ProductFilters, { FilterSection } from '@/components/product/ProductFilters';
import MobileFilterPanel from '@/components/product/MobileFilterPanel';

type FilterOption = {
  id: string;
  label: string;
};

interface ProductOverviewClientProps {
  products: Product[];
  filterOptions: {
    volumes: FilterOption[];
    collections: FilterOption[];
    tags: FilterOption[];
  };
}

export default function ProductOverviewClient({ products, filterOptions }: ProductOverviewClientProps) {
  const t = useTranslations('ProductOverview');
  const locale = useLocale();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [volumeFilter, setVolumeFilter] = useState<string[]>([]);
  const [collectionFilter, setCollectionFilter] = useState<string[]>([]);
  const [fragranceNotesFilter, setFragranceNotesFilter] = useState<string[]>([]);

  // Build filter sections with state (filter out empty sections)
  const filterSections: FilterSection[] = useMemo(() => [
    {
      id: 'sort',
      title: t('sort.title'),
      type: 'radio',
      options: [
        { id: 'default', label: t('sort.default') },
        { id: 'name-asc', label: t('sort.nameAsc') },
        { id: 'name-desc', label: t('sort.nameDesc') },
        { id: 'price-asc', label: t('sort.priceAsc') },
        { id: 'price-desc', label: t('sort.priceDesc') },
      ],
      value: sortBy,
      onChange: (value) => setSortBy(value as string),
    },
    ...(filterOptions.volumes.length > 0 ? [{
      id: 'volume' as const,
      title: t('filterSections.volume'),
      type: 'checkbox' as const,
      options: filterOptions.volumes,
      value: volumeFilter,
      onChange: (value: string | string[]) => setVolumeFilter(value as string[]),
    }] : []),
    ...(filterOptions.collections.length > 0 ? [{
      id: 'collection' as const,
      title: t('filterSections.collection'),
      type: 'checkbox' as const,
      options: filterOptions.collections,
      value: collectionFilter,
      onChange: (value: string | string[]) => setCollectionFilter(value as string[]),
    }] : []),
    ...(filterOptions.tags.length > 0 ? [{
      id: 'fragrance-notes' as const,
      title: t('filterSections.fragranceNotes'),
      type: 'checkbox' as const,
      options: filterOptions.tags,
      value: fragranceNotesFilter,
      onChange: (value: string | string[]) => setFragranceNotesFilter(value as string[]),
    }] : []),
  ], [sortBy, volumeFilter, collectionFilter, fragranceNotesFilter, filterOptions, t]);

  // Apply filters and sorting - memoized to avoid re-sorting on every render
  const displayProducts = useMemo(() => {
    let filtered = [...products];

    // Find filter sections
    const sortSection = filterSections.find(s => s.id === 'sort');
    const volumeSection = filterSections.find(s => s.id === 'volume');
    const collectionSection = filterSections.find(s => s.id === 'collection');
    const fragranceNotesSection = filterSections.find(s => s.id === 'fragrance-notes');

    // Apply volume filter
    const volumeFilters = (volumeSection?.value as string[]) || [];
    if (volumeFilters.length > 0) {
      filtered = filtered.filter(p => p.volumeValue && volumeFilters.includes(p.volumeValue));
    }

    // Apply collection filter
    const collectionFilters = (collectionSection?.value as string[]) || [];
    if (collectionFilters.length > 0) {
      filtered = filtered.filter(p => p.collectionSlug && collectionFilters.includes(p.collectionSlug));
    }

    // Apply fragrance notes filter (tags)
    const fragranceNotesFilters = (fragranceNotesSection?.value as string[]) || [];
    if (fragranceNotesFilters.length > 0) {
      filtered = filtered.filter(p =>
        p.tagSlugs && p.tagSlugs.some(slug => fragranceNotesFilters.includes(slug))
      );
    }

    // Apply sorting
    const sortBy = sortSection?.value as string || 'default';
    switch (sortBy) {
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name, locale));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name, locale));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        // Keep default order
        break;
    }

    return filtered;
  }, [products, filterSections, locale]);

  return (
    <>
      {/* Filter Button and Product Count - Mobile */}
      <div className="lg:hidden flex items-center justify-between px-6 border-b">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex justify-start gap-2 py-4 pr-4  hover:text-gray-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{fillRule: 'evenodd', clipRule: 'evenodd', strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 1.5 }}>
              <path d="M5,8l14,0" fill="none" strokeWidth="1.04px"/>
              <path d="M5,16l14,-0" fill="none" strokeWidth="1.04px"/>
              <path d="M9.5,7.648l0,0.704c0,0.194 -0.158,0.351 -0.352,0.351l-1.296,0c-0.194,0 -0.352,-0.157 -0.352,-0.351l0,-0.704c0,-0.194 0.158,-0.351 0.352,-0.351l1.296,-0c0.194,-0 0.352,0.157 0.352,0.351Z" fill="none" strokeWidth="1.04px" style={{strokeMiterlimit:2}} />
              <path d="M16.5,15.648l0,0.704c0,0.194 -0.158,0.351 -0.352,0.351l-1.296,0c-0.194,0 -0.352,-0.157 -0.352,-0.351l0,-0.704c0,-0.194 0.158,-0.351 0.352,-0.351l1.296,-0c0.194,-0 0.352,0.157 0.352,0.351Z" fill="none" strokeWidth="1.04px" style={{strokeMiterlimit:2}} />
            </svg>
        </button>
        <span className="text-sm text-gray-700">{displayProducts.length} {t('samples')}</span>
      </div>

      {/* Main Content */}
      <div className="flex border-b">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 px-8 py-8 sticky top-0 h-screen overflow-y-auto">
          <div className="flex items-center justify-start mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8" style={{fillRule: 'evenodd', clipRule: 'evenodd', strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 1.5 }}>
              <path d="M5,8l14,0" fill="none" strokeWidth="1.04px"/>
              <path d="M5,16l14,-0" fill="none" strokeWidth="1.04px"/>
              <path d="M9.5,7.648l0,0.704c0,0.194 -0.158,0.351 -0.352,0.351l-1.296,0c-0.194,0 -0.352,-0.157 -0.352,-0.351l0,-0.704c0,-0.194 0.158,-0.351 0.352,-0.351l1.296,-0c0.194,-0 0.352,0.157 0.352,0.351Z" fill="none" strokeWidth="1.04px" style={{strokeMiterlimit:2}} />
              <path d="M16.5,15.648l0,0.704c0,0.194 -0.158,0.351 -0.352,0.351l-1.296,0c-0.194,0 -0.352,-0.157 -0.352,-0.351l0,-0.704c0,-0.194 0.158,-0.351 0.352,-0.351l1.296,-0c0.194,-0 0.352,0.157 0.352,0.351Z" fill="none" strokeWidth="1.04px" style={{strokeMiterlimit:2}} />
            </svg>
            <h2 className="ml-4 text-2xl font-bold">{t('filters')}</h2>
          </div>
          <ProductFilters sections={filterSections} />
        </aside>

        {/* Mobile Filter Panel */}
        <MobileFilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filterSections={filterSections}
          filtersText={t('filters')}
        />

        {/* Product Grid */}
        <main className="flex-1 px-4 lg:px-12 py-8">
          {/* Desktop Product Count */}
          <div className="hidden lg:flex justify-end mb-6">
            <span className="text-sm text-gray-600">{displayProducts.length} {t('samples')}</span>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-10 gap-x-6 lg:gap-12">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
