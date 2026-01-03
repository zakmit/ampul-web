import ProductOverviewClient from '@/components/ProductOverviewClient';
import { Product } from '@/components/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { getCollectionBySlug, getProductsByCollectionSlug, getFilterOptionsForCollection, getAllCollectionSlugs } from './data';
import type { Locale } from '@/i18n/config';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const tBreadcrumb = await getTranslations({ locale, namespace: 'Breadcrumb' });

  // Fetch collection data, products, and filter options from database
  const [collectionData, productsData, filterOptionsData] = await Promise.all([
    getCollectionBySlug(slug, locale),
    getProductsByCollectionSlug(slug, locale),
    getFilterOptionsForCollection(slug, locale),
  ]);

  // If collection not found, show 404
  if (!collectionData) {
    notFound();
  }

  // Transform database products to Product interface for ProductCard
  const products: Product[] = productsData.map(p => ({
    id: p.id,
    name: p.name,
    quote: p.concept,
    price: p.price,
    volume: p.volume,
    volumeValue: p.volumeValue,
    volumeId: p.volumeId,
    image: p.productImage,
    slug: p.slug,
    collectionId: p.collectionId,
    collectionSlug: p.collectionSlug,
    tagIds: p.tagIds,
    tagSlugs: p.tagSlugs,
  }));

  // Prepare filter options (serializable data only, no functions)
  // Note: No collections filter since we're already in a collection
  const filterOptions = {
    volumes: filterOptionsData.volumes.map(v => ({
      id: v.value,
      label: v.displayName,
    })),
    collections: [], // No collection filter in collection view
    tags: filterOptionsData.tags.map(t => ({
      id: t.slug,
      label: t.name,
    })),
  };

  return (
    <div className="max-w-360 mx-auto">
      {/* Header Section */}
      <div className="px-6 lg:px-12 pt-8 lg:pt-12 pb-6 lg:pb-8 border-b">
        <h1 className="text-4xl lg:text-5xl font-bold text-center mb-4">
          {collectionData.name}
        </h1>
        <p className="text-center italic text-gray-700 max-w-3xl mx-auto">
          {collectionData.description}
        </p>
      </div>

      {/* Client Component with Filter State */}
      <ProductOverviewClient products={products} filterOptions={filterOptions} />
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { href: `/${locale}`, label: tBreadcrumb('home') },
          { label: collectionData.name },
        ]}
      />
    </div>
  );
}

// Generate static params for all collections across all locales
export async function generateStaticParams() {
  const slugs = await getAllCollectionSlugs();
  // Return slugs without locale - the [locale] segment will handle that
  return slugs;
}
