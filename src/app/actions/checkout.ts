'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/config'
import { sendOrderConfirmationEmail } from '@/lib/email'
import {
  decrementRegularInventory,
  decrementSampleInventory,
  InventoryUnavailableError,
  localeToDbLocale,
} from '@/lib/inventory'

function getDbLocale(locale: Locale): string {
  return localeToDbLocale[locale]
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
  locale: Locale,
  guestEmail?: string
) {
  const session = await auth()
  const email = session?.user?.email || guestEmail

  if (!email) {
    return { error: 'An email address is required to place an order' }
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

  const normalizedItems = Array.from(
    items.reduce((acc, item) => {
      const key = `${item.productId}:${item.volumeId}`
      const existing = acc.get(key)
      acc.set(key, { ...item, quantity: (existing?.quantity ?? 0) + item.quantity })
      return acc
    }, new Map<string, { productId: string; volumeId: number; quantity: number }>()).values()
  )

  const dbLocale = getDbLocale(locale)
  const fallbackLocale = 'en-US'

  // Get currency from translations
  const tCommon = await getTranslations({ locale, namespace: 'Common' })
  const currency = tCommon('currency')

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = session?.user?.email
        ? await tx.user.findUnique({ where: { email: session.user.email } })
        : null
      const productIds = [...new Set(normalizedItems.map((item) => item.productId))]
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isDeleted: false },
        include: {
          translations: { where: { locale: { in: [dbLocale, fallbackLocale] } } },
          category: { include: { translations: { where: { locale: { in: [dbLocale, fallbackLocale] } } } } },
          volumes: {
            where: { locale: dbLocale },
            include: { volume: { include: { translations: { where: { locale: { in: [dbLocale, fallbackLocale] } } } } } },
          },
        },
      })

      let total = 0
      const orderItemsData: Array<{
        productId: string
        productName: string
        productImage: string
        productSlug: string
        productCategory: string
        productVolume: string | null
        quantity: number
        price: number
        isFreeSample: boolean
        inventoryLocale: string
        inventoryVolumeId: number | null
      }> = []

      for (const item of normalizedItems) {
        const product = products.find((candidate) => candidate.id === item.productId)
        const volumeData = product?.volumes.find((volume) => volume.volumeId === item.volumeId)
        if (!product || !volumeData || item.quantity < 1 || item.quantity > 10) {
          throw new InventoryUnavailableError([{
            productId: item.productId,
            volumeId: item.volumeId,
            requested: item.quantity,
            available: volumeData?.stock ?? 0,
            isFreeSample: false,
          }])
        }

        await decrementRegularInventory(tx, { ...item, locale: dbLocale })
        const translation = product.translations.find((entry) => entry.locale === dbLocale)
          ?? product.translations.find((entry) => entry.locale === fallbackLocale)
        const categoryTranslation = product.category.translations.find((entry) => entry.locale === dbLocale)
          ?? product.category.translations.find((entry) => entry.locale === fallbackLocale)
        const volumeTranslation = volumeData.volume.translations.find((entry) => entry.locale === dbLocale)
          ?? volumeData.volume.translations.find((entry) => entry.locale === fallbackLocale)
        const price = Number(volumeData.price)
        total += price * item.quantity
        orderItemsData.push({
          productId: product.id,
          productName: translation?.name ?? product.slug,
          productImage: product.productImage,
          productSlug: product.slug,
          productCategory: categoryTranslation?.name ?? '',
          productVolume: volumeTranslation?.displayName ?? volumeData.volume.value,
          quantity: item.quantity,
          price,
          isFreeSample: false,
          inventoryLocale: dbLocale,
          inventoryVolumeId: item.volumeId,
        })
      }

      if (selectedSample) {
        const sampleProduct = await tx.product.findUnique({
          where: { slug: selectedSample, isDeleted: false },
          include: {
            translations: { where: { locale: { in: [dbLocale, fallbackLocale] } } },
            category: { include: { translations: { where: { locale: { in: [dbLocale, fallbackLocale] } } } } },
          },
        })
        if (!sampleProduct) {
          throw new InventoryUnavailableError([{ productId: selectedSample, volumeId: null, requested: 1, available: 0, isFreeSample: true }])
        }
        await decrementSampleInventory(tx, { productId: sampleProduct.id, locale: dbLocale })
        const translation = sampleProduct.translations.find((entry) => entry.locale === dbLocale)
          ?? sampleProduct.translations.find((entry) => entry.locale === fallbackLocale)
        const categoryTranslation = sampleProduct.category.translations.find((entry) => entry.locale === dbLocale)
          ?? sampleProduct.category.translations.find((entry) => entry.locale === fallbackLocale)
        orderItemsData.push({
          productId: sampleProduct.id,
          productName: translation?.name ?? sampleProduct.slug,
          productImage: sampleProduct.productImage,
          productSlug: sampleProduct.slug,
          productCategory: categoryTranslation?.name ?? '',
          productVolume: null,
          quantity: 1,
          price: 0,
          isFreeSample: true,
          inventoryLocale: dbLocale,
          inventoryVolumeId: null,
        })
      }

      const order = await tx.order.create({
        data: {
          userId: user?.id,
          customerEmail: email,
          customerName: user?.name ?? null,
          recipientName: address.recipientName,
          recipientPhone: address.recipientPhone || null,
          shippingLine1: address.addressLine1,
          shippingLine2: address.addressLine2 || null,
          shippingCity: address.city,
          shippingRegion: address.region || null,
          shippingPostal: address.postalCode,
          shippingCountry: address.country,
          paymentMethod: 'demo',
          total,
          currency,
          status: 'PENDING',
          items: { create: orderItemsData },
        },
      })
      if (user) {
        await tx.user.update({ where: { id: user.id }, data: { lastOrderAt: new Date() } })
      }
      return { order, user, orderItemsData, total }
    })

    const { order, user, orderItemsData, total } = result

    // Send confirmation email (non-blocking — failure does not affect order result)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const orderUrl = `${baseUrl}/${locale}/checkout/success?orderId=${order.id}`
    void sendOrderConfirmationEmail(email, {
      orderNumber: order.orderNumber,
      orderId: order.id,
      customerName: user?.name ?? null,
      recipientName: address.recipientName,
      recipientPhone: address.recipientPhone || null,
      shippingLine1: address.addressLine1,
      shippingLine2: address.addressLine2 || null,
      shippingCity: address.city,
      shippingRegion: address.region || null,
      shippingPostal: address.postalCode,
      shippingCountry: address.country,
      items: orderItemsData.map((item) => ({
        productName: item.productName,
        productImage: item.productImage,
        productCategory: item.productCategory,
        productVolume: item.productVolume ?? null,
        quantity: item.quantity,
        price: item.price,
        isFreeSample: item.isFreeSample,
      })),
      total,
      currency,
      orderUrl,
    }, locale)

    return { success: true, orderId: order.id, orderNumber: order.orderNumber }
  } catch (error) {
    if (error instanceof InventoryUnavailableError) {
      return { error: 'inventoryUnavailable', inventoryIssues: error.issues }
    }
    console.error('Error creating order:', error)
    return { error: 'Failed to create order. Please try again.' }
  }
}
