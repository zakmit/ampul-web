import Link from 'next/link';
import Image from 'next/image';
import AddToBagButton from '@/components/AddToBagButton';
import { prisma } from '@/lib/prisma';
import type { Locale } from '@/i18n/config';
import { getTranslations } from 'next-intl/server';
import HeroCarousel from '@/components/home/HeroCarousel';
import HeroCarouselMobile from '@/components/home/HeroCarouselMobile';
import ScrollSection from '@/components/home/ScrollSection';
import BottleViewer from '@/components/home/BottleViewer';
import MobileCharacterSections from '@/components/home/MobileCharacterSections';

const localeToDbLocale: Record<Locale, string> = {
  'us': 'en-US',
  'fr': 'fr-FR',
  'tw': 'zh-TW',
};

interface HomePageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const dbLocale = localeToDbLocale[locale];
  const fallbackDbLocale = localeToDbLocale['us'];
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const tGM = await getTranslations({ locale, namespace: 'GreekMythology' });

  // Product slugs in the order: Cassandre, Narcisse, Icarus, Antigone
  const productSlugs = ['cassandre', 'narcisse', 'icare', 'antigone'];

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

  // Transform products to character items
  const characters = sortedProducts.map((product) => {
    const currentTranslation = product.translations.find(t => t.locale === dbLocale);
    const fallbackTranslation = product.translations.find(t => t.locale === fallbackDbLocale);

    const productVolume = product.volumes.find(pv => pv.locale === dbLocale)
      || product.volumes.find(pv => pv.locale === fallbackDbLocale);

    const volumeTranslation = productVolume?.volume.translations.find(t => t.locale === dbLocale)
      || productVolume?.volume.translations.find(t => t.locale === fallbackDbLocale);

    const descriptionKey = `characters.${product.slug}` as 'characters.antigone' | 'characters.narcisse' | 'characters.icare' | 'characters.cassandre';

    return {
      id: product.id,
      slug: product.slug,
      volumeId: productVolume?.volumeId || 0,
      title: currentTranslation?.name || fallbackTranslation?.name || product.slug,
      quote: currentTranslation?.concept || fallbackTranslation?.concept || '',
      description: t(descriptionKey),
      image: `/landing/${product.slug}.webp`,
      productImage: product.productImage,
      price: productVolume ? Number(productVolume.price) : undefined,
      volume: volumeTranslation?.displayName || productVolume?.volume.value,
    };
  });

  // Get sensations for Icare and Antigone
  const icare = sortedProducts.find(p => p.slug === 'icare');
  const icareTranslation = icare?.translations.find(t => t.locale === dbLocale) || icare?.translations.find(t => t.locale === fallbackDbLocale);

  const antigone = sortedProducts.find(p => p.slug === 'antigone');
  const antigoneTranslation = antigone?.translations.find(t => t.locale === dbLocale) || antigone?.translations.find(t => t.locale === fallbackDbLocale);

  // Hero carousel slides
  const heroSlides = [
    {
      image: '/landing/hero-collection.jpg',
      alt: 'Explore Greek Mythology Collection',
      title: tGM('title'),
      description: tGM('description'),
      textColor: 'dark' as const,
      link: `/${locale}/e/greek-mythology`
    },
    {
      image: '/landing/hero-icare.jpg',
      alt: 'Icarus',
      title: icareTranslation?.name || 'Icare',
      description: icareTranslation?.sensations || '',
      textColor: 'light' as const,
      link: `/${locale}/p/icare`
    },
    {
      image: '/landing/hero-antigone.jpg',
      alt: 'Antigone',
      title: antigoneTranslation?.name || 'Antigone',
      description: antigoneTranslation?.sensations || '',
      textColor: 'light' as const,
      link: `/${locale}/p/antigone`
    },
  ];

  return (
    <div className="overflow-hidden max-w-400 mx-auto">
      {/* Hero Section with Carousel */}
      {/* Mobile */}
      <section className="lg:hidden">
        <HeroCarouselMobile slides={heroSlides} />
      </section>
      {/* Desktop */}
      <section className="hidden lg:block relative lg:w-dvw lg:h-[56.25dvw]">
        <HeroCarousel slides={heroSlides} />
      </section>

      {/* The Concept Section */}
      <section className="bg-white py-8 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-2xl lg:text-5xl font-bold mb-4 lg:mb-6">{t('conceptTitle')}</h2>
          <p className="text-sm lg:text-xl italic leading-relaxed">
            {t('conceptDescription')}
          </p>
        </div>
      </section>

      {/* Character Sections - Mobile */}
      <div className="lg:hidden">
        <MobileCharacterSections
          characters={characters}
          locale={locale}
          checkDetailText={tGM('checkDetail')}
        />
      </div>

      {/* Character Sections - Desktop (Paired) */}
      <div className="hidden lg:block bg-olive-700 text-center">
        {/* Cassandre (Right) & Narcisse (Left) */}
        <ScrollSection className="h-dvh content-center" enableSticky={true}>
          <div className="w-full h-full text-gold">
            {/* Background Image */}
            <div className="absolute h-dvh w-[84.2dvh] left-3/5 " style={{ filter: 'drop-shadow(0 4px 4px oklch(0.2743 0.028 140.74))' }}>
                <Image
                  src={characters[0].image}
                  alt={characters[0].title}
                  fill
                  className="object-cover"
                />
            </div>
            <div className="absolute h-dvh w-[84.2dvh] right-3/5 " style={{ filter: 'drop-shadow(0 4px 4px oklch(0.2743 0.028 140.74))' }}>
                <Image
                  src={characters[1].image}
                  alt={characters[1].title}
                  fill
                  className="object-cover"
                />
            </div>


            <div className="h-full">
              {/* Cassandre - Right */}
              <div className="">
                <h2 className="absolute left-6/11 top-4 text-2xl italic w-75">{characters[0].quote}</h2>
                <div className='absolute left-5/11 translate-x-1/5 top-28 w-50 flex flex-col items-center'>
                  <span className="text-base font-title italic mb-4">{characters[0].description}</span>
                  <Link
                    href={`/${locale}/p/${characters[0].slug}`}
                    className="inline-block border border-gold text-gold hover:bg-gold hover:text-olive-700 px-6 py-2 text-sm transition-colors"
                  >
                    {tGM('checkDetail')}
                  </Link>
                </div>
              </div>

              {/* Narcisse - Left */}
              <div className="">
                <h2 className="absolute left-1/3 top-1/2 text-2xl italic w-75">{characters[1].quote}</h2>
                <div className='absolute left-2/5 translate-x-6 top-3/5 translate-y-6 w-53 flex flex-col items-center'>
                  <span className="text-base font-title italic mb-4">{characters[1].description}</span>
                  <Link
                    href={`/${locale}/p/${characters[1].slug}`}
                    className="inline-block border border-gold text-gold hover:bg-gold hover:text-olive-700 px-6 py-2 text-sm transition-colors"
                  >
                    {tGM('checkDetail')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ScrollSection>

        {/* Icarus (Right) & Antigone (Left) */}
        <ScrollSection className="h-dvh content-center" enableSticky={true}>
          <div className="w-full h-full text-gold">
            {/* Background Image - Icarus */}
            <div className="absolute h-dvh w-[84.2dvh] left-3/5 " style={{ filter: 'drop-shadow(0 4px 4px oklch(0.2743 0.028 140.74))' }}>
                <Image
                  src={characters[2].image}
                  alt={characters[2].title}
                  fill
                  className="object-cover"
                />
            </div>
            <div className="absolute h-dvh w-[84.2dvh] right-3/5 " style={{ filter: 'drop-shadow(0 4px 4px oklch(0.2743 0.028 140.74))' }}>
                <Image
                  src={characters[3].image}
                  alt={characters[3].title}
                  fill
                  className="object-cover"
                />
            </div>


            <div className="relative h-full max-w-7xl mx-auto">
              {/* Icarus - Right */}
              <div className="">
                <h2 className="absolute left-3/11 translate-x-1/6 top-12 text-2xl italic w-75">{characters[2].quote}</h2>
                <div className='absolute left-3/11 translate-x-30 top-40 w-60 flex flex-col items-center'>
                  <span className="text-base font-title italic mb-4">{characters[2].description}</span>
                  <Link
                    href={`/${locale}/p/${characters[2].slug}`}
                    className="inline-block border border-gold text-gold hover:bg-gold hover:text-olive-700 px-6 py-2 text-sm transition-colors"
                  >
                    {tGM('checkDetail')}
                  </Link>
                </div>
              </div>

              {/* Antigone - Left */}
              <div className="">
                <h2 className="absolute left-3/11 translate-x-34 top-4/7 text-2xl italic w-54">{characters[3].quote}</h2>
                <div className='absolute left-5/11 top-5/7 w-53 flex flex-col items-center'>
                  <span className="text-base font-title italic mb-4">{characters[3].description}</span>
                  <Link
                    href={`/${locale}/p/${characters[3].slug}`}
                    className="inline-block border border-gold text-gold hover:bg-gold hover:text-olive-700 px-6 py-2 text-sm transition-colors"
                  >
                    {tGM('checkDetail')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ScrollSection>
      </div>

      {/* The Bottle Section */}
      <section className="bg-white pt-12 lg:py-24">
        <div className=" lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          {/* Left: Title and Description */}
          <div>
            <h2 className="text-3xl lg:text-5xl font-bold text-center mb-4">{t('bottleTitle')}</h2>
            {/* Mobile Bottle Viewer */}
            <div className="lg:hidden">
              <BottleViewer isMobile={true} />
            </div>
            <p className="text-sm pt-4 italic px-6 lg:text-lg text-center mb-6">
              {t('bottleDescription')}
            </p>
          </div>
          {/* Right: Desktop Bottle Viewer */}
          <div className="hidden lg:block">
            <BottleViewer isMobile={false} />
          </div>
        </div>
      </section>

      {/* Explore the Fragrances Section */}
      <section className="bg-gray-100 py-6 lg:py-20 border-b border-gray-500 inset-shadow-[0_4px_4px_0] inset-shadow-gray-900/20 lg:inset-shadow-none">
        <div className="max-w-7xl mx-auto px-4 lg:px-12">
          <h2 className="text-2xl lg:text-4xl italic font-bold text-center mb-8 lg:mb-12">
            {t('exploreFragrances')}
          </h2>

          {/* Mobile: horizontal scroll */}
          <div className="flex gap-4 overflow-x-auto lg:hidden text-center pb-4 -mx-4 px-4">
            {characters.map((character) => (
              <div key={character.slug} className="flex flex-col shrink-0 w-[calc(50vw-24px)]">
                <Link href={`/${locale}/p/${character.slug}`} className="block">
                  <div className="aspect-square relative mb-3">
                    <Image
                      src={character.productImage}
                      alt={character.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
                <h3 className="font-bold text-base mb-1">{character.title}</h3>
                <p className="content-start text-xs px-2 h-12 italic mb-2 line-clamp-3">
                  {character.quote}
                </p>
                {character.price && character.volume && (
                  <p className="text-xs mb-3">{character.volume} · {character.price} $</p>
                )}
                <AddToBagButton
                  productId={character.id}
                  volumeId={character.volumeId}
                  label={tGM('addToBag')}
                  className="bg-gray-700 text-white px-4 py-2 mx-8 text-xs hover:bg-gray-900 transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Desktop: 4-column grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-8 text-center">
            {characters.map((character) => (
              <div key={character.slug} className="flex flex-col">
                <Link href={`/${locale}/p/${character.slug}`} className="block">
                  <div className="aspect-square relative mb-4 overflow-hidden group">
                    <Image
                      src={character.productImage}
                      alt={character.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{character.title}</h3>
                  <p className="text-sm italic text-gray-700 mb-3 h-10 line-clamp-2">
                    {character.quote}
                  </p>
                </Link>
                {character.price && character.volume && (
                  <p className="text-sm mb-4">{character.volume} · {character.price} $</p>
                )}
                <AddToBagButton
                  productId={character.id}
                  volumeId={character.volumeId}
                  label={tGM('addToBag')}
                  className="bg-gray-700 text-white px-6 py-2 mx-10 text-sm hover:bg-gray-900 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}
