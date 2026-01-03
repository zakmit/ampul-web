'use server'

import { prisma } from '@/lib/prisma'
import type { Locale } from '@/i18n/config'
import { localeToMessageFile } from '@/i18n/config'

// Map URL locale to database locale
function getDbLocale(locale: Locale): string {
  return localeToMessageFile[locale] || 'en-US'
}

export interface ShoppingBagItemDetails {
  productId: string
  productSlug: string
  productName: string
  productSubtitle: string // category name
  productImage: string
  volumeId: number
  volumeDisplay: string
  quantity: number
  price: number
}

export async function getShoppingBagItems(
  items: Array<{ productId: string; volumeId: number; quantity: number }>,
  locale: Locale
): Promise<ShoppingBagItemDetails[]> {
  if (items.length === 0) return []

  const dbLocale = getDbLocale(locale)
  const fallbackLocale = 'en-US'
  const productIds = items.map((item) => item.productId)

  // Fetch all products with their volumes and translations
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isDeleted: false,
    },
    include: {
      translations: {
        where: {
          locale: {
            in: [dbLocale, fallbackLocale],
          },
        },
      },
      category: {
        include: {
          translations: {
            where: {
              locale: {
                in: [dbLocale, fallbackLocale],
              },
            },
          },
        },
      },
      volumes: {
        where: {
          locale: {
            in: [dbLocale, fallbackLocale],
          },
        },
        include: {
          volume: {
            include: {
              translations: {
                where: {
                  locale: {
                    in: [dbLocale, fallbackLocale],
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  // Map the products to shopping bag item details
  const bagItems: ShoppingBagItemDetails[] = []

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) continue

    // Get translation with fallback
    const translation =
      product.translations.find((t) => t.locale === dbLocale) ||
      product.translations.find((t) => t.locale === fallbackLocale)

    // Get category translation with fallback
    const categoryTranslation =
      product.category.translations.find((t) => t.locale === dbLocale) ||
      product.category.translations.find((t) => t.locale === fallbackLocale)

    // Get volume data for the requested locale with fallback
    let volumeData = product.volumes.find((v) => v.volumeId === item.volumeId && v.locale === dbLocale)
    if (!volumeData) {
      volumeData = product.volumes.find((v) => v.volumeId === item.volumeId && v.locale === fallbackLocale)
    }

    if (!translation || !volumeData) continue

    // Get volume translation with fallback
    const volumeTranslation =
      volumeData.volume.translations.find((t) => t.locale === dbLocale) ||
      volumeData.volume.translations.find((t) => t.locale === fallbackLocale)

    bagItems.push({
      productId: product.id,
      productSlug: product.slug,
      productName: translation.name,
      productSubtitle: categoryTranslation?.name || '',
      productImage: product.productImage,
      volumeId: item.volumeId,
      volumeDisplay: volumeTranslation?.displayName || volumeData.volume.value,
      quantity: item.quantity,
      price: Number(volumeData.price),
    })
  }

  return bagItems
}

// Get all products for free sample selection
export async function getAvailableProductsForSample(locale: Locale) {
  const dbLocale = getDbLocale(locale)
  const fallbackLocale = 'en-US'

  const products = await prisma.product.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      translations: {
        where: {
          locale: {
            in: [dbLocale, fallbackLocale],
          },
        },
      },
    },
    orderBy: {
      slug: 'asc',
    },
  })

  return products.map((product) => {
    const translation =
      product.translations.find((t) => t.locale === dbLocale) ||
      product.translations.find((t) => t.locale === fallbackLocale)

    return {
      value: product.slug,
      label: translation?.name || product.slug,
    }
  })
}
