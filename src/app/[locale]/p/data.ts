import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import type { Locale } from '@/i18n/config'

// Map short locale codes to database locale codes
const localeToDbLocale: Record<Locale, string> = {
  'us': 'en-US',
  'fr': 'fr-FR',
  'tw': 'zh-TW',
}

export type ProductListData = {
  id: string
  slug: string
  name: string
  concept: string
  productImage: string
  price: number
  volume: string // Display name (translated)
  volumeValue: string // Raw value for filtering
  volumeId: number // Volume ID for shopping bag
  collectionId: number
  collectionSlug: string
  collectionName: string
  tagIds: number[]
  tagSlugs: string[]
}

export type FilterOptionsData = {
  volumes: {
    id: number
    value: string
    displayName: string
  }[]
  collections: {
    id: number
    slug: string
    name: string
  }[]
  tags: {
    id: number
    slug: string
    name: string
  }[]
}

// Fetch all products with filtering support (cached per-request)
export const getAllProducts = cache(async (locale: Locale = 'us'): Promise<ProductListData[]> => {
  try {
    // Convert short locale to database locale
    const dbLocale = localeToDbLocale[locale]
    const fallbackDbLocale = localeToDbLocale['us']

    // Filter translations at DB level to reduce data transfer
    const localeFilter = { locale: { in: [dbLocale, fallbackDbLocale] } }

    const products = await prisma.product.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        collection: {
          include: {
            translations: { where: localeFilter },
          },
        },
        translations: { where: localeFilter },
        volumes: {
          include: {
            volume: {
              include: {
                translations: { where: localeFilter },
              },
            },
          },
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: { where: localeFilter },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return products.map(product => {
      // Get translations for current locale and fallback (en-US)
      const currentTranslation = product.translations.find(t => t.locale === dbLocale)
      const fallbackTranslation = product.translations.find(t => t.locale === fallbackDbLocale)

      const currentCollectionTranslation = product.collection.translations.find(t => t.locale === dbLocale)
      const fallbackCollectionTranslation = product.collection.translations.find(t => t.locale === fallbackDbLocale)

      // Get first available volume for price and display (prefer current locale)
      const firstVolume = product.volumes.find(pv => pv.locale === dbLocale)
        || product.volumes.find(pv => pv.locale === fallbackDbLocale)
        || product.volumes[0]

      const volumeTranslation = firstVolume?.volume.translations.find(t => t.locale === dbLocale)
        || firstVolume?.volume.translations.find(t => t.locale === fallbackDbLocale)
        || firstVolume?.volume.translations[0]

      // Get all tags for this product
      const tags = product.tags.map(pt => {
        const currentTagTranslation = pt.tag.translations.find(t => t.locale === dbLocale)
        const fallbackTagTranslation = pt.tag.translations.find(t => t.locale === fallbackDbLocale)

        return {
          id: pt.tag.id,
          slug: pt.tag.slug,
          name: currentTagTranslation?.name || fallbackTagTranslation?.name || pt.tag.slug,
        }
      })

      return {
        id: product.id,
        slug: product.slug,
        name: currentTranslation?.name || fallbackTranslation?.name || '',
        concept: currentTranslation?.concept || fallbackTranslation?.concept || '',
        productImage: product.productImage,
        price: firstVolume ? Number(firstVolume.price) : 0,
        volume: volumeTranslation?.displayName || firstVolume?.volume.value || '',
        volumeValue: firstVolume?.volume.value || '',
        volumeId: firstVolume?.volumeId || 0,
        collectionId: product.collection.id,
        collectionSlug: product.collection.slug,
        collectionName: currentCollectionTranslation?.name || fallbackCollectionTranslation?.name || '',
        tagIds: tags.map(t => t.id),
        tagSlugs: tags.map(t => t.slug),
      }
    })
  } catch (error) {
    console.error('Error fetching all products:', error)
    throw error
  }
})

// Fetch all filter options from database (cached per-request)
export const getFilterOptions = cache(async (locale: Locale = 'us'): Promise<FilterOptionsData> => {
  try {
    // Convert short locale to database locale
    const dbLocale = localeToDbLocale[locale]
    const fallbackDbLocale = localeToDbLocale['us']

    // Filter translations at DB level to reduce data transfer
    const localeFilter = { locale: { in: [dbLocale, fallbackDbLocale] } }

    // Fetch all filter options in parallel
    const [volumes, collections, tags] = await Promise.all([
      prisma.volume.findMany({
        include: {
          translations: { where: localeFilter },
        },
        orderBy: {
          value: 'asc',
        },
      }),
      prisma.collection.findMany({
        include: {
          translations: { where: localeFilter },
        },
        orderBy: {
          id: 'asc',
        },
      }),
      prisma.tag.findMany({
        include: {
          translations: { where: localeFilter },
        },
        orderBy: {
          slug: 'asc',
        },
      }),
    ])

    return {
      volumes: volumes.map(volume => {
        const translation = volume.translations.find(t => t.locale === dbLocale)
          || volume.translations.find(t => t.locale === fallbackDbLocale)
          || volume.translations[0]

        return {
          id: volume.id,
          value: volume.value,
          displayName: translation?.displayName || volume.value,
        }
      }),
      collections: collections.map(collection => {
        const translation = collection.translations.find(t => t.locale === dbLocale)
          || collection.translations.find(t => t.locale === fallbackDbLocale)
          || collection.translations[0]

        return {
          id: collection.id,
          slug: collection.slug,
          name: translation?.name || collection.slug,
        }
      }),
      tags: tags.map(tag => {
        const translation = tag.translations.find(t => t.locale === dbLocale)
          || tag.translations.find(t => t.locale === fallbackDbLocale)
          || tag.translations[0]

        return {
          id: tag.id,
          slug: tag.slug,
          name: translation?.name || tag.slug,
        }
      }),
    }
  } catch (error) {
    console.error('Error fetching filter options:', error)
    throw error
  }
})
