'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/config'
import { localeToMessageFile } from '@/i18n/config'

function getDbLocale(locale: Locale): string {
  return localeToMessageFile[locale] || 'en-US'
}

export interface CheckoutAddress {
  recipientName: string
  recipientPhone: string
  addressLine1: string
  addressLine2: string
  city: string
  region: string
  postalCode: string
  country: string
}

export interface CheckoutFormData extends CheckoutAddress {
  useProfileAddress: boolean
}

export async function getUserAddress() {
  const session = await auth()

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { address: true }
  })

  if (!user?.address) {
    return null
  }

  return {
    recipientName: user.name || '',
    recipientPhone: user.phone || '',
    addressLine1: user.address.addressLine1,
    addressLine2: user.address.addressLine2 || '',
    city: user.address.city,
    region: user.address.region || '',
    postalCode: user.address.postalCode,
    country: user.address.country,
  }
}

export async function createOrder(
  items: Array<{ productId: string; volumeId: number; quantity: number }>,
  selectedSample: string | null,
  address: CheckoutAddress,
  locale: Locale
) {
  const session = await auth()

  if (!session?.user?.email) {
    return { error: 'You must be signed in to place an order' }
  }

  // Validate address
  const errors: Record<string, string> = {}

  if (!address.recipientName?.trim()) {
    errors.recipientName = 'recipientNameRequired'
  }
  if (!address.addressLine1?.trim()) {
    errors.addressLine1 = 'addressLine1Required'
  }
  if (!address.city?.trim()) {
    errors.city = 'cityRequired'
  }
  if (!address.postalCode?.trim()) {
    errors.postalCode = 'postalCodeRequired'
  }
  if (!address.country?.trim()) {
    errors.country = 'countryRequired'
  }

  if (Object.keys(errors).length > 0) {
    return { fieldErrors: errors }
  }

  if (items.length === 0) {
    return { error: 'Your shopping bag is empty' }
  }

  const dbLocale = getDbLocale(locale)
  const fallbackLocale = 'en-US'

  // Get currency from translations
  const tCommon = await getTranslations({ locale, namespace: 'Common' })
  const currency = tCommon('currency')

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    // Fetch product details
    const productIds = items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isDeleted: false,
      },
      include: {
        translations: {
          where: {
            locale: { in: [dbLocale, fallbackLocale] },
          },
        },
        category: {
          include: {
            translations: {
              where: {
                locale: { in: [dbLocale, fallbackLocale] },
              },
            },
          },
        },
        volumes: {
          where: {
            locale: { in: [dbLocale, fallbackLocale] },
          },
          include: {
            volume: {
              include: {
                translations: {
                  where: {
                    locale: { in: [dbLocale, fallbackLocale] },
                  },
                },
              },
            },
          },
        },
      },
    })

    // Calculate total and prepare order items
    let total = 0
    const orderItemsData: Array<{
      productId: string
      productName: string
      productImage: string
      productSlug: string
      productCategory: string
      productVolume?: string | null
      quantity: number
      price: number
      isFreeSample: boolean
    }> = []

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) continue

      const translation =
        product.translations.find((t) => t.locale === dbLocale) ||
        product.translations.find((t) => t.locale === fallbackLocale)

      const categoryTranslation =
        product.category.translations.find((t) => t.locale === dbLocale) ||
        product.category.translations.find((t) => t.locale === fallbackLocale)

      let volumeData = product.volumes.find(
        (v) => v.volumeId === item.volumeId && v.locale === dbLocale
      )
      if (!volumeData) {
        volumeData = product.volumes.find(
          (v) => v.volumeId === item.volumeId && v.locale === fallbackLocale
        )
      }

      if (!translation || !volumeData) continue

      const volumeTranslation =
        volumeData.volume.translations.find((t) => t.locale === dbLocale) ||
        volumeData.volume.translations.find((t) => t.locale === fallbackLocale)

      const price = Number(volumeData.price)
      total += price * item.quantity

      orderItemsData.push({
        productId: product.id,
        productName: translation.name,
        productImage: product.productImage,
        productSlug: product.slug,
        productCategory: categoryTranslation?.name || '',
        productVolume: volumeTranslation?.displayName || volumeData.volume.value,
        quantity: item.quantity,
        price: price,
        isFreeSample: false,
      })
    }

    // Add free sample if selected
    if (selectedSample) {
      const sampleProduct = await prisma.product.findUnique({
        where: { slug: selectedSample },
        include: {
          translations: {
            where: {
              locale: { in: [dbLocale, fallbackLocale] },
            },
          },
          category: {
            include: {
              translations: {
                where: {
                  locale: { in: [dbLocale, fallbackLocale] },
                },
              },
            },
          },
        },
      })

      if (sampleProduct) {
        const translation =
          sampleProduct.translations.find((t) => t.locale === dbLocale) ||
          sampleProduct.translations.find((t) => t.locale === fallbackLocale)

        const categoryTranslation =
          sampleProduct.category.translations.find((t) => t.locale === dbLocale) ||
          sampleProduct.category.translations.find((t) => t.locale === fallbackLocale)

        if (translation) {
          orderItemsData.push({
            productId: sampleProduct.id,
            productName: translation.name,
            productImage: sampleProduct.productImage,
            productSlug: sampleProduct.slug,
            productCategory: categoryTranslation?.name || '',
            productVolume: null,
            quantity: 1,
            price: 0,
            isFreeSample: true,
          })
        }
      }
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        customerEmail: session.user.email,
        customerName: user.name,
        recipientName: address.recipientName,
        recipientPhone: address.recipientPhone || null,
        shippingLine1: address.addressLine1,
        shippingLine2: address.addressLine2 || null,
        shippingCity: address.city,
        shippingRegion: address.region || null,
        shippingPostal: address.postalCode,
        shippingCountry: address.country,
        paymentMethod: 'demo',
        total: total,
        currency: currency,
        status: 'PROCESSING',
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    })

    return { success: true, orderId: order.id, orderNumber: order.orderNumber }
  } catch (error) {
    console.error('Error creating order:', error)
    return { error: 'Failed to create order. Please try again.' }
  }
}
