import type { Prisma } from '@/generated/prisma/client'
import type { Locale } from '@/i18n/config'

export const LOW_STOCK_THRESHOLD = 10

export const localeToDbLocale: Record<Locale, string> = {
  us: 'en-US',
  fr: 'fr-FR',
  tw: 'zh-TW',
}

export type InventoryStatus = 'outOfStock' | 'lowStock' | 'inStock'

export type InventoryAvailability = {
  stock: number
  status: InventoryStatus
  canPurchase: boolean
}

export function getInventoryAvailability(stock: number | null | undefined): InventoryAvailability {
  const normalizedStock = Math.max(0, stock ?? 0)

  if (normalizedStock === 0) {
    return { stock: 0, status: 'outOfStock', canPurchase: false }
  }

  if (normalizedStock <= LOW_STOCK_THRESHOLD) {
    return { stock: normalizedStock, status: 'lowStock', canPurchase: true }
  }

  return { stock: normalizedStock, status: 'inStock', canPurchase: true }
}

export class InventoryUnavailableError extends Error {
  constructor(
    public readonly issues: Array<{
      productId: string
      volumeId: number | null
      requested: number
      available: number
      isFreeSample: boolean
    }>
  ) {
    super('Inventory is no longer available')
    this.name = 'InventoryUnavailableError'
  }
}

export async function decrementRegularInventory(
  tx: Prisma.TransactionClient,
  item: { productId: string; volumeId: number; locale: string; quantity: number }
) {
  const result = await tx.productVolume.updateMany({
    where: {
      productId: item.productId,
      volumeId: item.volumeId,
      locale: item.locale,
      stock: { gte: item.quantity },
    },
    data: { stock: { decrement: item.quantity } },
  })

  if (result.count === 0) {
    const current = await tx.productVolume.findUnique({
      where: {
        productId_volumeId_locale: {
          productId: item.productId,
          volumeId: item.volumeId,
          locale: item.locale,
        },
      },
      select: { stock: true },
    })
    throw new InventoryUnavailableError([{
      productId: item.productId,
      volumeId: item.volumeId,
      requested: item.quantity,
      available: current?.stock ?? 0,
      isFreeSample: false,
    }])
  }
}

export async function decrementSampleInventory(
  tx: Prisma.TransactionClient,
  item: { productId: string; locale: string }
) {
  const result = await tx.productSampleInventory.updateMany({
    where: {
      productId: item.productId,
      locale: item.locale,
      stock: { gte: 1 },
    },
    data: { stock: { decrement: 1 } },
  })

  if (result.count === 0) {
    const current = await tx.productSampleInventory.findUnique({
      where: { productId_locale: { productId: item.productId, locale: item.locale } },
      select: { stock: true },
    })
    throw new InventoryUnavailableError([{
      productId: item.productId,
      volumeId: null,
      requested: 1,
      available: current?.stock ?? 0,
      isFreeSample: true,
    }])
  }
}

export async function restoreOrderInventory(
  tx: Prisma.TransactionClient,
  orderId: string
) {
  const marked = await tx.order.updateMany({
    where: { id: orderId, inventoryRestoredAt: null },
    data: { inventoryRestoredAt: new Date() },
  })

  if (marked.count === 0) return false

  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      items: {
        select: {
          productId: true,
          inventoryLocale: true,
          inventoryVolumeId: true,
          quantity: true,
          isFreeSample: true,
        },
      },
    },
  })

  if (!order) return false

  for (const item of order.items) {
    if (!item.productId || !item.inventoryLocale) continue

    if (item.isFreeSample) {
      const restored = await tx.productSampleInventory.updateMany({
        where: { productId: item.productId, locale: item.inventoryLocale },
        data: { stock: { increment: item.quantity } },
      })
      if (restored.count !== 1) throw new Error('Sample inventory row missing during restoration')
    } else if (item.inventoryVolumeId) {
      const restored = await tx.productVolume.updateMany({
        where: {
          productId: item.productId,
          volumeId: item.inventoryVolumeId,
          locale: item.inventoryLocale,
        },
        data: { stock: { increment: item.quantity } },
      })
      if (restored.count !== 1) throw new Error('Regular inventory row missing during restoration')
    }
  }

  return true
}
