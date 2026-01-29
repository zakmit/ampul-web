import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ExpandableSections from '@/components/product/ExpandableSections';
import Breadcrumb from '@/components/common/Breadcrumb';
import AddToBagButton from '@/components/product/AddToBagButton';
import { getProductBySlug, getCollectionProducts, getAllProductSlugs } from './data';
import type { Locale } from '@/i18n/config';

interface ProductDetailPageProps {
  params: Promise<{
    locale: Locale;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const productData = await getProductBySlug(slug, locale);

  if (!productData) {
    return {
      title: 'Product Not Found - AMPUL',
    };
  }

  return {
    title: `${productData.name} - ${productData.category.name} - AMPUL`,
    description: productData.sensations,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'ProductDetail' });
  const tBreadcrumb = await getTranslations({ locale, namespace: 'Breadcrumb' });
  const tCommon = await getTranslations({ locale, namespace: 'Common' });

  // Fetch product data from Prisma
  const productData = await getProductBySlug(slug, locale);

  if (!productData) {
    notFound();
  }

  // Image order: [coverImage1x1, productImage, boxImage, ...galleryImages]
  const productImages = [
    productData.images.coverImage1x1,
    productData.images.productImage,
    productData.images.boxImage,
    ...productData.images.galleryImages,
  ];

  // Get first volume for display
  const firstVolume = productData.volumes[0];
  const volumeDisplay = firstVolume ? `${firstVolume.displayName}` : '';
  const price = firstVolume ? firstVolume.price : 0;

  const product = {
    name: productData.name,
    subtitle: productData.category.name,
    quote: productData.concept,
    volume: volumeDisplay,
    price: price,
    sensations: productData.sensations,
    images: productImages,
  };

  const infoSections = [
    {
      id: 'delivery',
      title: t('infoSections.delivery.title'),
      content: t('infoSections.delivery.content')
    },
    {
      id: 'returns',
      title: t('infoSections.returns.title'),
      content: t('infoSections.returns.content')
    },
    {
      id: 'refill',
      title: t('infoSections.refill.title'),
      content: t('infoSections.refill.content')
    },
  ];

  // Fetch products from the same collection
  const collectionProducts = await getCollectionProducts(productData.collection.id, productData.id, locale);

  const relatedProducts = collectionProducts.map(p => ({
    name: p.name,
    subtitle: p.concept,
    image: p.productImage,
    slug: p.slug,
  }));

  return (
    <div className="overflow-x-hidden max-w-360 mx-auto">
      {/* Main Product Section */}
      <div className="flex items-center lg:items-start flex-col lg:flex-row">
        {/* Product Image Section - Mobile: full width, Desktop: 5/8 width sticky */}
        <div className="relative w-screen h-[100vw] max-w-150 max-h-150 lg:w-[62.5%] lg:max-w-225 lg:h-225 lg:max-h-225 lg:sticky lg:top-0 flex items-center justify-center bg-transparent">
          <div className="w-full lg:max-w-none lg:w-full h-full flex items-center justify-center">
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>
        </div>

        {/* Product Details Section - Mobile: full width below, Desktop: 3/8 width */}
        <div className="bg-white lg:w-[37.5%]">
          <div className="w-full mx-auto lg:max-w-none px-6 lg:px-12 pt-2 lg:pt-8 pb-8 lg:pb-16">
            {/* Product Title - Mobile: center, Desktop: right-aligned */}
            <h1 className="text-4xl lg:text-5xl font-bold text-center mb-1 lg:text-left lg:mb-2">
              {product.name}
            </h1>
            <p className="text-center lg:text-left text-xs lg:text-base mb-2 lg:mb-6">
              {product.subtitle}
            </p>

            {/* Quote - Mobile: center, Desktop: right-aligned */}
            <h3 className="text-center lg:text-left italic font-light mb-4 lg:mb-8 leading-relaxed lg:text-lg">
              {product.quote}
            </h3>

            {/* Volume and Add to Bag - Mobile: center, Desktop: right-aligned */}
            <div className="flex items-center font-context justify-center gap-8 mb-8 lg:mb-8">
              <span className="text-gray-700">{product.volume}</span>
              <AddToBagButton
                productId={productData.id}
                volumeId={firstVolume?.volumeId || 0}
                label={`${t('addToBag')} · ${product.price} ${tCommon('currency')}`}
                className="bg-gray-700 hover:bg-gray-900 text-gray-100 font-semibold px-5 lg:px-6 py-3 transition-colors cursor-pointer"
              />
            </div>

            {/* Sensations */}
            <div className="mb-8 lg:mb-8 -mx-6 lg:mx-0 px-6 lg:px-0 py-6 lg:py-6 inset-shadow-[0_4px_4px_0] inset-shadow-gray-900/20 lg:inset-shadow-none bg-gray-100 ">
              <h2 className="text-2xl lg:text-3xl italic font-bold text-center mb-1 lg:mb-2 mx-auto">
                {t('sensations')}
              </h2>
              <p className="text-center italic text-sm lg:text-base lg:px-4 text-gray-700 mx-auto">
                {product.sensations}
              </p>
            </div>

            {/* Expandable Sections */}
            <ExpandableSections sections={infoSections} />

            {/* Free Sample Note */}
            <p className="text-sm text-gray-500 mt-6 lg:mt-8 italic">
              {t('freeSample')}
            </p>
          </div>
        </div>
      </div>

      {/* Explore the Collection - Mobile: scrollable, Desktop: grid */}
      <div className="bg-gray-100 inset-shadow-[0_4px_4px_0] inset-shadow-gray-900/20 lg:inset-shadow-none">
        <div className="max-w-150 lg:max-w-7xl mx-auto px-6 lg:px-12 pt-6 lg:pt-16 lg:pb-16">
          <h2 className="text-3xl lg:text-4xl italic font-bold text-center mb-8 lg:mb-12">
            {t('exploreCollection')}
          </h2>

          {/* Mobile: Horizontal scroll */}
          <div className="flex lg:hidden gap-6 overflow-x-auto pb-6 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.slug}
                href={`/${locale}/p/${relatedProduct.slug}`}
                className="shrink-0 w-48 snap-start group"
              >
                <div className="aspect-[1] relative overflow-hidden mb-2">
                  <Image
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-center font-bold text-lg hover:text-gray-500 hover:underline">
                  {relatedProduct.name}
                </h3>
                <p className="text-center text-xs px-1">
                  {relatedProduct.subtitle}
                </p>
              </Link>
            ))}
          </div>

          {/* Desktop: Flex with overflow-x */}
          <div className="hidden lg:flex gap-8 overflow-x-auto pb-6 -mx-12 px-12">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.slug}
                href={`/${locale}/p/${relatedProduct.slug}`}
                className="group shrink-0 w-64"
              >
                <div className="aspect-[1] relative overflow-hidden mb-4">
                  <Image
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    fill
                    sizes="(max-width: 768px) 40vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-center font-bold text-xl mb-1 hover:text-gray-500 hover:underline">
                  {relatedProduct.name}
                </h3>
                <p className="text-center text-sm italic px-2">
                  {relatedProduct.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { href: `/${locale}`, label: tBreadcrumb('home') },
          { href: `/${locale}/p`, label: tBreadcrumb('fragrances') },
          { href: `/${locale}/c/${productData.collection.slug}`, label: productData.collection.name },
          { label: product.name },
        ]}
      />
    </div>
  );
}

// Generate static params for all products across all locales
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  // Return slugs without locale - the [locale] segment will handle that
  return slugs;
}
