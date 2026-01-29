import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/common/Breadcrumb';
import AddToBagButton from '@/components/product/AddToBagButton';
import { prisma } from '@/lib/prisma';
import type { Locale } from '@/i18n/config';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

// Map short locale codes to database locale codes
const localeToDbLocale: Record<Locale, string> = {
  'us': 'en-US',
  'fr': 'fr-FR',
  'tw': 'zh-TW',
};

interface CollectionItem {
  title: string;
  description: string;
  sideNote: string;
  textColor: 'dark' | 'light';
  alignment: 'left' | 'right';
  imageMobile: string;
  imageDesktop: string;
  productSlug?: string;
  productId?: string;
  volumeId?: number;
  price?: number;
  volume?: string;
  relatedLink?: string;
}

// Keep CollectionData structure for future improvements when using collection type
// interface CollectionData {
//   title: string;
//   description: string;
//   type: 'Collection' | 'Event';
//   heroImageMobile: string;
//   heroImageDesktop: string;
//   items: CollectionItem[];
//   relatedProducts: {
//     title: string;
//     description: string;
//     price: number;
//     volume: string;
//     image: string;
//     slug: string;
//   }[];
// }

interface CollectionPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('greekMythology.title'),
    description: t('greekMythology.description'),
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { locale } = await params;
  const dbLocale = localeToDbLocale[locale];
  const fallbackDbLocale = localeToDbLocale['us'];
  const t = await getTranslations({ locale, namespace: 'GreekMythology' });
  const tBreadcrumb = await getTranslations({ locale, namespace: 'Breadcrumb' });
  const tCommon = await getTranslations({ locale, namespace: 'Common' });

  // Product slugs for Greek Mythology collection
  const productSlugs = ['antigone', 'narcisse', 'icare', 'cassandre'];

  // Fetch products from database
  const products = await prisma.product.findMany({
    where: {
      slug: { in: productSlugs },
      isDeleted: false,
    },
    include: {
      translations: true,
      volumes: {
        include: {
          volume: {
            include: {
              translations: true,
            }
          }
        }
      }
    }
  });

  // Sort products to match the order in productSlugs
  const sortedProducts = productSlugs
    .map(slug => products.find(p => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  // Transform database products to collection items
  // Note: sideNote, textColor, alignment don't exist in DB yet - using hardcoded values for now
  const items: CollectionItem[] = sortedProducts.map((product) => {
    // Get translations with fallback
    const currentTranslation = product.translations.find(t => t.locale === dbLocale);
    const fallbackTranslation = product.translations.find(t => t.locale === fallbackDbLocale);

    // Get volume for current locale with fallback
    const productVolume = product.volumes.find(pv => pv.locale === dbLocale)
      || product.volumes.find(pv => pv.locale === fallbackDbLocale);

    const volumeTranslation = productVolume?.volume.translations.find(t => t.locale === dbLocale)
      || productVolume?.volume.translations.find(t => t.locale === fallbackDbLocale);

    // Hardcoded layout values (future: move to database)
    const layoutConfig = {
      antigone: { textColor: 'dark' as const, alignment: 'right' as const },
      narcisse: { textColor: 'light' as const, alignment: 'left' as const },
      icare: { textColor: 'light' as const, alignment: 'right' as const },
      cassandre: { textColor: 'light' as const, alignment: 'left' as const },
    }[product.slug] || { textColor: 'dark' as const, alignment: 'left' as const };

    // Get translated side note
    const sideNoteKey = `sideNotes.${product.slug}` as 'sideNotes.antigone' | 'sideNotes.narcisse' | 'sideNotes.icare' | 'sideNotes.cassandre';
    const sideNote = t(sideNoteKey);

    return {
      title: currentTranslation?.name || fallbackTranslation?.name || product.slug,
      description: currentTranslation?.concept || fallbackTranslation?.concept || '',
      sideNote,
      textColor: layoutConfig.textColor,
      alignment: layoutConfig.alignment,
      imageMobile: product.coverImage1x1,
      imageDesktop: product.coverImage16x9,
      productSlug: product.slug,
      productId: product.id,
      volumeId: productVolume?.volumeId,
      price: productVolume ? Number(productVolume.price) : undefined,
      volume: volumeTranslation?.displayName || productVolume?.volume.value,
    };
  });

  // Related products - using same products with productImage
  const relatedProducts = sortedProducts.map(product => {
    const currentTranslation = product.translations.find(t => t.locale === dbLocale);
    const fallbackTranslation = product.translations.find(t => t.locale === fallbackDbLocale);

    const productVolume = product.volumes.find(pv => pv.locale === dbLocale)
      || product.volumes.find(pv => pv.locale === fallbackDbLocale);

    const volumeTranslation = productVolume?.volume.translations.find(t => t.locale === dbLocale)
      || productVolume?.volume.translations.find(t => t.locale === fallbackDbLocale);

    return {
      id: product.id,
      volumeId: productVolume?.volumeId || 0,
      title: currentTranslation?.name || fallbackTranslation?.name || product.slug,
      description: currentTranslation?.concept || fallbackTranslation?.concept || '',
      price: productVolume ? Number(productVolume.price) : 0,
      volume: volumeTranslation?.displayName || productVolume?.volume.value || '',
      image: product.productImage,
      slug: product.slug,
    };
  });

  // Hardcoded collection info (future: fetch from Collection model)
  const collectionData = {
    title: t('title'),
    description: t('description'),
    type: 'Collection' as const, // Keep for future use
    heroImageMobile: '/promo/collection-gm-m.jpg',
    heroImageDesktop: '/promo/collection-gm-sq.jpg',
    items,
    relatedProducts,
  };

  const relatedSectionTitle = collectionData.type === 'Collection'
    ? t('exploreCollection')
    : 'Related Products';

  return (
    <div className="overflow-x-hidden max-w-360 mx-auto">
      {/* Hero Section - Mobile */}
      <div className="lg:hidden relative w-full bg-white"
      style={{ height: 'calc(100vw / 1.618)' }}>
        <Image
          src={collectionData.heroImageMobile}
          alt={collectionData.title}
          sizes="(max-width: 1440px) 100vw, 1440px"
          fill
          className="object-cover object-center"
          priority
        />
      </div>
      <div className="lg:hidden w-full inset-0 flex flex-col text-center px-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 mt-4">
            {collectionData.title}
          </h1>
          <p className="text-sm italic text-gray-700 mx-6 mb-6">
            {collectionData.description}
          </p>
      </div>
      {/* Hero Section - Desktop */}
      <div className="hidden lg:block relative w-full h-202.5 bg-gray-200">
        <Image
          src={collectionData.heroImageDesktop}
          alt={collectionData.title}
          sizes="(max-width: 1440px) 100vw, 1440px"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 mb-6">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {collectionData.title}
          </h1>
          <p className="text-base italic text-gray-700 max-w-2xl">
            {collectionData.description}
          </p>
        </div>
      </div>

      {/* Product Showcase Sections */}
      {collectionData.items.map((item, index) => (
        <div key={index} className="relative">
          {/* Mobile Layout - Side by side grid */}
          <div className="lg:hidden">
            <div
              className="grid grid-cols-2 bg-none"
              style={{ height: 'calc(50vw * 1.618)' }}
            >
              {/* Image*/}
              <div className="w-full absolute col-span-2" style={{ height: 'calc(50vw * 1.618)' }}>
                <Image
                  src={item.imageDesktop}
                  alt={item.title}
                  sizes="(max-width: 1440px) 100vw, 1440px"
                  fill
                  className="object-cover object-center"
                />
              </div>
              {/* Content */}
              <div className={`relative w-full h-full flex items-center justify-center px-6 ${
                item.alignment === 'right' ? 'col-start-2' : 'col-start-1'}`}
              >
                <div className={`bg-gray-800/20 -my-3 py-3 -mx-3 px-3 rounded-md backdrop-blur-sm text-left ${
                  item.textColor === 'light' ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  <h2 className="text-xl font-bold mb-2">{item.title}</h2>
                  <p className="italic text-sm mb-4 text-balance">{item.description}</p>
                  <p className={`italic font-light text-xs mb-3 text-right`}
                  >{item.sideNote}</p>
                  {item.price && item.volume && (
                    <p className="text-xs text-center mb-3">{item.volume} · {item.price} {tCommon('currency')}</p>
                  )}
                  <div className="flex flex-col gap-2 px-2 mx-auto max-w-60">
                    {(item.productSlug || item.relatedLink) && (
                      <Link
                        href={item.productSlug ? `/${locale}/p/${item.productSlug}` : item.relatedLink!}
                        className={`inline-block border bg-gray-100/30 backdrop-blur-sm py-1.5 text-xs transition-colors text-center hover:bg-gray-700 hover:text-gray-100 hover:border-gray-700 ${
                          item.textColor === 'light'
                            ? 'border-gray-100 text-gray-100 '
                            : 'border-gray-900 text-gray-900 '
                        }`}
                      >
                        {t('checkDetail')}
                      </Link>
                    )}
                    {item.price && item.productId && item.volumeId && (
                      <AddToBagButton
                        productId={item.productId}
                        volumeId={item.volumeId}
                        label={t('addToBag')}
                        className={`py-1.5 text-xs hover:bg-gray-700 transition-colors ${
                          item.textColor === 'light'
                            ? 'bg-gray-100 text-gray-900 hover:text-gray-100'
                            : 'bg-gray-900 text-gray-100'
                        }`}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block relative h-202.5">
            <Image
              src={item.imageDesktop}
              alt={item.title}
              sizes="(max-width: 1440px) 100vw, 1440px"
              fill
              className="object-cover object-center"
            />
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-72 ${
                item.alignment === 'left'
                  ? 'left-[12.5%]'
                  : 'right-[12.5%]'
              }`}
            >
              <div className={item.textColor === 'light' ? 'text-gray-100' : 'text-gray-900'}>
                <h2 className="text-5xl font-bold mb-4">{item.title}</h2>
                <p className="italic text-xl mb-4 leading-relaxed">{item.description}</p>
                <p className="italic font-light text-sm mb-6">{item.sideNote}</p>
                {item.price && item.volume && (
                  <p className="text-sm text-center mb-6">{item.volume} · {item.price} {tCommon('currency')}</p>
                )}
                <div className="flex flex-col gap-3">
                  {(item.productSlug || item.relatedLink) && (
                    <Link
                      href={item.productSlug ? `/${locale}/p/${item.productSlug}` : item.relatedLink!}
                      className={`inline-block border px-6 py-2 text-sm text-center bg-gray-100/30 backdrop-blur-sm transition-colors hover:bg-gray-700 hover:text-gray-100 hover:border-gray-700 ${
                        item.textColor === 'light'
                          ? 'border-gray-100 text-gray-100 '
                          : 'border-gray-900 text-gray-900 '
                      }`}
                    >
                      {t('checkDetail')}
                    </Link>
                  )}
                  {item.price && item.productId && item.volumeId && (
                    <AddToBagButton
                      productId={item.productId}
                      volumeId={item.volumeId}
                      label={t('addToBag')}
                      className={`px-6 py-2 text-sm transition-colors hover:bg-gray-700 ${
                        item.textColor === 'light'
                          ? 'bg-gray-100 text-gray-900 hover:text-gray-100'
                          : 'bg-gray-900 text-gray-100'
                      }`}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Related Products / Explore Collection Section */}
      <div className="bg-gray-100 inset-shadow-[0_4px_4px_0] inset-shadow-gray-900/20 lg:inset-shadow-none">
        <div className="max-w-7xl mx-auto px-4 lg:px-12 pt-6 pb-6 lg:pt-16 lg:pb-16">
          <h2 className="text-2xl lg:text-4xl italic font-bold text-center mb-8 lg:mb-12">
            {relatedSectionTitle}
          </h2>

          {/* Mobile: horizontal scroll */}
          <div className="flex gap-4 overflow-x-auto lg:hidden text-center pb-4 -mx-4 px-4">
            {collectionData.relatedProducts.map((product) => (
              <div key={product.slug} className="flex flex-col shrink-0 w-[calc(50vw-24px)] max-w-60">
                <Link href={`/${locale}/p/${product.slug}`} className="block group">
                  <div className="aspect-square relative mb-3 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.title}
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <h3 className="font-bold text-base mb-1 hover:text-gray-500 hover:underline">{product.title}</h3>
                  <p className="content-start text-xs px-2 h-12 italic mb-2 line-clamp-3">
                    {product.description}
                  </p>
                </Link>
                <p className="text-xs mb-3">{product.volume} · {product.price} {tCommon('currency')}</p>
                <AddToBagButton
                  productId={product.id}
                  volumeId={product.volumeId}
                  label={t('addToBag')}
                  className="bg-gray-700 text-white py-2 mx-4 text-xs hover:bg-gray-900 transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Desktop: 4-column grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-8 text-center">
            {collectionData.relatedProducts.map((product) => (
              <div key={product.slug} className="flex flex-col">
                <Link href={`/${locale}/p/${product.slug}`} className="block group">
                  <div className="aspect-square relative mb-4 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.title}
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                <h3 className="font-bold text-xl mb-2 hover:text-gray-500 hover:underline">{product.title}</h3>
                <p className="text-sm italic text-gray-700 mb-3 h-10 line-clamp-2">
                  {product.description}
                </p>
                </Link>

                <p className="text-sm mb-4">{product.volume} · {product.price} {tCommon('currency')}</p>
                <AddToBagButton
                  productId={product.id}
                  volumeId={product.volumeId}
                  label={t('addToBag')}
                  className="bg-gray-700 text-white px-6 py-2 mx-10 text-sm hover:bg-gray-900 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { href: `/${locale}`, label: tBreadcrumb('home') },
          { label: collectionData.title },
        ]}
      />
    </div>
  );
}
