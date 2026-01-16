import ProductOverviewClient from '@/components/product/ProductOverviewClient';
import { Product } from '@/components/product/ProductCard';
import Breadcrumb from '@/components/common/Breadcrumb';
import { getAllProducts, getFilterOptions } from './data';
import type { Locale } from '@/i18n/config';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

interface ProductsPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('fragrances.title'),
    description: t('fragrances.description'),
  };
}

export default async function ProductsPage({
  params,
}: ProductsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ProductsPage' });
  const tBreadcrumb = await getTranslations({ locale, namespace: 'Breadcrumb' });

  // Fetch products and filter options from database
  const [productsData, filterOptionsData] = await Promise.all([
    getAllProducts(locale),
    getFilterOptions(locale),
  ]);

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
  const filterOptions = {
    volumes: filterOptionsData.volumes.map(v => ({
      id: v.value,
      label: v.displayName,
    })),
    collections: filterOptionsData.collections.map(c => ({
      id: c.slug,
      label: c.name,
    })),
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
          {t('title')}
        </h1>
        <p className="text-center italic max-w-3xl mx-auto">
          {t('description')}
        </p>
      </div>

      {/* Client Component with Filter State */}
      <ProductOverviewClient products={products} filterOptions={filterOptions} />
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { href: `/${locale}`, label: tBreadcrumb('home') },
          { label: tBreadcrumb('fragrances') },
        ]}
      />
    </div>
  );
}
