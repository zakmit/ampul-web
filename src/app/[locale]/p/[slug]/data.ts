import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import type { Locale } from '@/i18n/config'

// Map short locale codes to database locale codes
const localeToDbLocale: Record<Locale, string> = {
  'us': 'en-US',
  'fr': 'fr-FR',
  'tw': 'zh-TW',
}

export type ProductDetailData = {
  id: string
  slug: string
  name: string
  category: {
    id: number
    slug: string
    name: string
  }
  collection: {
    id: number
    slug: string
    name: string
  }
  concept: string
  sensations: string
  images: {
    coverImage1x1: string
    productImage: string
    boxImage: string
    galleryImages: string[]
  }
  volumes: {
    volumeId: number
    value: string
    displayName: string
    price: number
    stock: number | null
  }[]
  tags: {
    id: number
    slug: string
    name: string
  }[]
}

export type CollectionProductData = {
  id: string
  slug: string
  name: string
  concept: string
  productImage: string
  price: number
  volume: string
}

// Fetch product by slug with all relations (cached per-request)
export const getProductBySlug = cache(async (slug: string, locale: Locale = 'us'): Promise<ProductDetailData | null> => {
  try {
    // Convert short locale to database locale
    const dbLocale = localeToDbLocale[locale]
    const fallbackDbLocale = localeToDbLocale['us']

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          include: {
            translations: true,
          },
        },
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
    })

    if (!product) {
      return null
    }

    // Get translations for current locale and fallback (en-US)
    const currentTranslation = product.translations.find(t => t.locale === dbLocale)
    const fallbackTranslation = product.translations.find(t => t.locale === fallbackDbLocale)

    const currentCategoryTranslation = product.category.translations.find(t => t.locale === dbLocale)
    const fallbackCategoryTranslation = product.category.translations.find(t => t.locale === fallbackDbLocale)

    const currentCollectionTranslation = product.collection.translations.find(t => t.locale === dbLocale)
    const fallbackCollectionTranslation = product.collection.translations.find(t => t.locale === fallbackDbLocale)

    // Transform volumes data
    // First, get volumes for current locale, then fallback to en-US if needed
    const currentLocaleVolumes = product.volumes.filter(pv => pv.locale === dbLocale)
    const fallbackLocaleVolumes = product.volumes.filter(pv => pv.locale === fallbackDbLocale)

    // Combine with current locale taking priority
    const volumesToUse = currentLocaleVolumes.length > 0 ? currentLocaleVolumes : fallbackLocaleVolumes

    const volumes = volumesToUse.map(pv => {
      const volumeTranslation = pv.volume.translations.find(t => t.locale === dbLocale)
        || pv.volume.translations.find(t => t.locale === fallbackDbLocale)
        || pv.volume.translations[0]

      return {
        volumeId: pv.volumeId,
        value: pv.volume.value,
        displayName: volumeTranslation?.displayName || pv.volume.value,
        price: Number(pv.price),
        stock: pv.stock,
      }
    })

    // Transform tags with field-level fallback
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
      category: {
        id: product.category.id,
        slug: product.category.slug,
        name: currentCategoryTranslation?.name || fallbackCategoryTranslation?.name || '',
      },
      collection: {
        id: product.collection.id,
        slug: product.collection.slug,
        name: currentCollectionTranslation?.name || fallbackCollectionTranslation?.name || '',
      },
      concept: currentTranslation?.concept || fallbackTranslation?.concept || '',
      sensations: currentTranslation?.sensations || fallbackTranslation?.sensations || '',
      images: {
        coverImage1x1: product.coverImage1x1,
        productImage: product.productImage,
        boxImage: product.boxImage,
        galleryImages: product.galleryImages,
      },
      volumes,
      tags,
    }
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    throw error
  }
})

// Fetch all products in the same collection (cached per-request)
export const getCollectionProducts = cache(async (collectionId: number, currentProductId: string, locale: Locale = 'us'): Promise<CollectionProductData[]> => {
  try {
    // Convert short locale to database locale
    const dbLocale = localeToDbLocale[locale]
    const fallbackDbLocale = localeToDbLocale['us']

    const products = await prisma.product.findMany({
      where: {
        collectionId,
        id: {
          not: currentProductId, // Exclude current product
        },
      },
      include: {
        translations: true,
        volumes: {
          include: {
            volume: true,
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

      // Get first volume for current locale, fallback to en-US if not found
      const firstVolume = product.volumes.find(pv => pv.locale === dbLocale)
        || product.volumes.find(pv => pv.locale === fallbackDbLocale)

      return {
        id: product.id,
        slug: product.slug,
        name: currentTranslation?.name || fallbackTranslation?.name || '',
        concept: currentTranslation?.concept || fallbackTranslation?.concept || '',
        productImage: product.productImage,
        price: firstVolume ? Number(firstVolume.price) : 0,
        volume: firstVolume?.volume.value || '',
      }
    })
  } catch (error) {
    console.error('Error fetching collection products:', error)
    throw error
  }
})

// Generate static params for all products (cached per-request)
export const getAllProductSlugs = cache(async () => {
  try {
    const products = await prisma.product.findMany({
      select: {
        slug: true,
      },
    })

    return products.map(p => ({ slug: p.slug }))
  } catch (error) {
    console.error('Error fetching product slugs:', error)
    return []
  }
})
