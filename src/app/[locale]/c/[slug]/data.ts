import { prisma } from '@/lib/prisma'
import type { Locale } from '@/i18n/config'

// Map short locale codes to database locale codes
const localeToDbLocale: Record<Locale, string> = {
  'us': 'en-US',
  'fr': 'fr-FR',
  'tw': 'zh-TW',
}

export type CollectionData = {
  id: number
  slug: string
  name: string
  description: string
  coverImage1x1: string
  coverImage16x9: string
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
  tags: {
    id: number
    slug: string
    name: string
  }[]
}

// Fetch collection by slug
export async function getCollectionBySlug(slug: string, locale: Locale = 'us'): Promise<CollectionData | null> {
  try {
    // Convert short locale to database locale
    const dbLocale = localeToDbLocale[locale]
    const fallbackDbLocale = localeToDbLocale['us']

    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        translations: true,
      },
    })

    if (!collection) {
      return null
    }

    // Get translations for current locale and fallback (en-US)
    const currentTranslation = collection.translations.find(t => t.locale === dbLocale)
    const fallbackTranslation = collection.translations.find(t => t.locale === fallbackDbLocale)

    return {
      id: collection.id,
      slug: collection.slug,
      name: currentTranslation?.name || fallbackTranslation?.name || '',
      description: currentTranslation?.description || fallbackTranslation?.description || '',
      coverImage1x1: collection.coverImage1x1,
      coverImage16x9: collection.coverImage16x9,
    }
  } catch (error) {
    console.error('Error fetching collection by slug:', error)
    throw error
  }
}

// Fetch products by collection slug
export async function getProductsByCollectionSlug(collectionSlug: string, locale: Locale = 'us'): Promise<ProductListData[]> {
  try {
    // Convert short locale to database locale
    const dbLocale = localeToDbLocale[locale]
    const fallbackDbLocale = localeToDbLocale['us']

    // First find the collection
    const collection = await prisma.collection.findUnique({
      where: { slug: collectionSlug },
      include: {
        translations: true,
      },
    })

    if (!collection) {
      return []
    }

    // Fetch products for this collection
    const products = await prisma.product.findMany({
      where: {
        collectionId: collection.id,
        isDeleted: false,
      },
      include: {
        collection: {
          include: {
            translations: true,
          },
        },
        translations: true,
        volumes: {
          include: {
            volume: {
              include: {
                translations: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: true,
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
    console.error('Error fetching products by collection slug:', error)
    throw error
  }
}

// Fetch filter options for products in a specific collection
export async function getFilterOptionsForCollection(collectionSlug: string, locale: Locale = 'us'): Promise<FilterOptionsData> {
  try {
    // Convert short locale to database locale
    const dbLocale = localeToDbLocale[locale]
    const fallbackDbLocale = localeToDbLocale['us']

    // First find the collection
    const collection = await prisma.collection.findUnique({
      where: { slug: collectionSlug },
    })

    if (!collection) {
      return { volumes: [], tags: [] }
    }

    // Fetch all unique volumes used by products in this collection
    const productVolumes = await prisma.productVolume.findMany({
      where: {
        product: {
          collectionId: collection.id,
          isDeleted: false,
        },
      },
      include: {
        volume: {
          include: {
            translations: true,
          },
        },
      },
      distinct: ['volumeId'],
      orderBy: {
        volume: {
          value: 'asc',
        },
      },
    })

    // Fetch all unique tags used by products in this collection
    const productTags = await prisma.productTag.findMany({
      where: {
        product: {
          collectionId: collection.id,
          isDeleted: false,
        },
      },
      include: {
        tag: {
          include: {
            translations: true,
          },
        },
      },
      distinct: ['tagId'],
    })

    return {
      volumes: productVolumes.map(pv => {
        const translation = pv.volume.translations.find(t => t.locale === dbLocale)
          || pv.volume.translations.find(t => t.locale === fallbackDbLocale)
          || pv.volume.translations[0]

        return {
          id: pv.volume.id,
          value: pv.volume.value,
          displayName: translation?.displayName || pv.volume.value,
        }
      }),
      tags: productTags.map(pt => {
        const translation = pt.tag.translations.find(t => t.locale === dbLocale)
          || pt.tag.translations.find(t => t.locale === fallbackDbLocale)
          || pt.tag.translations[0]

        return {
          id: pt.tag.id,
          slug: pt.tag.slug,
          name: translation?.name || pt.tag.slug,
        }
      }),
    }
  } catch (error) {
    console.error('Error fetching filter options for collection:', error)
    throw error
  }
}

// Generate static params for all collections
export async function getAllCollectionSlugs() {
  try {
    const collections = await prisma.collection.findMany({
      select: {
        slug: true,
      },
    })

    return collections.map(c => ({ slug: c.slug }))
  } catch (error) {
    console.error('Error fetching collection slugs:', error)
    return []
  }
}
