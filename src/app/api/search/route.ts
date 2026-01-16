import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Locale } from '@/i18n/config'
import { getTranslations } from 'next-intl/server'

// Map short locale codes to database locale codes
const localeToDbLocale: Record<Locale, string> = {
  'us': 'en-US',
  'fr': 'fr-FR',
  'tw': 'zh-TW',
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const locale = (searchParams.get('locale') || 'us') as Locale

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [] })
  }

  try {
    // Get translations for the current locale
    const t = await getTranslations({ locale, namespace: 'SearchModal' })

    // Convert short locale to database locale
    const dbLocale = localeToDbLocale[locale]
    const fallbackDbLocale = localeToDbLocale['us']

    // Search products by translation name in the specified locale
    const products = await prisma.product.findMany({
      where: {
        isDeleted: false,
        translations: {
          some: {
            locale: dbLocale,
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
      },
      include: {
        translations: true,
        category: {
          include: {
            translations: true,
          },
        },
      },
      take: 10,
    })

    // Search collections by translation name in the specified locale
    const collections = await prisma.collection.findMany({
      where: {
        translations: {
          some: {
            locale: dbLocale,
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
      },
      include: {
        translations: true,
      },
      take: 10,
    })

    // Format the results with field-level fallback
    const formattedProducts = products.map((product) => {
      const currentTranslation = product.translations.find(t => t.locale === dbLocale)
      const fallbackTranslation = product.translations.find(t => t.locale === fallbackDbLocale)

      const currentCategoryTranslation = product.category.translations.find(t => t.locale === dbLocale)
      const fallbackCategoryTranslation = product.category.translations.find(t => t.locale === fallbackDbLocale)

      return {
        id: product.id,
        slug: product.slug,
        name: currentTranslation?.name || fallbackTranslation?.name || '',
        subtitle: currentCategoryTranslation?.name || fallbackCategoryTranslation?.name || '',
        description: currentTranslation?.concept || fallbackTranslation?.concept || '',
        image: product.productImage,
        type: 'product' as const,
      }
    })

    const formattedCollections = collections.map((collection) => {
      const currentTranslation = collection.translations.find(t => t.locale === dbLocale)
      const fallbackTranslation = collection.translations.find(t => t.locale === fallbackDbLocale)

      return {
        id: collection.id,
        slug: collection.slug,
        name: currentTranslation?.name || fallbackTranslation?.name || '',
        subtitle: t('collection'),
        description: currentTranslation?.description || fallbackTranslation?.description || '',
        image: collection.coverImage1x1,
        type: 'collection' as const,
      }
    })

    // Combine products and collections into a single results array
    const results = [...formattedProducts, ...formattedCollections]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}
