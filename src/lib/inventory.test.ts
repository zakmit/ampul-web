import { describe, expect, it, vi } from 'vitest'
import {
  decrementRegularInventory,
  getInventoryAvailability,
  localeToDbLocale,
  restoreOrderInventory,
} from './inventory'

describe('getInventoryAvailability', () => {
  it.each([
    [null, 'outOfStock', 0, false],
    [0, 'outOfStock', 0, false],
    [1, 'lowStock', 1, true],
    [10, 'lowStock', 10, true],
    [11, 'inStock', 11, true],
  ] as const)('maps stock %s to %s', (stock, status, normalized, canPurchase) => {
    expect(getInventoryAvailability(stock)).toEqual({
      stock: normalized,
      status,
      canPurchase,
    })
  })

  it('maps URL locales to database locales without message-file aliases', () => {
    expect(localeToDbLocale).toEqual({ us: 'en-US', fr: 'fr-FR', tw: 'zh-TW' })
  })
})

describe('inventory mutations', () => {
  it('reports the current amount when a conditional decrement loses the race', async () => {
    const tx = {
      productVolume: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findUnique: vi.fn().mockResolvedValue({ stock: 2 }),
      },
    }

    await expect(decrementRegularInventory(tx as never, {
      productId: 'product-1',
      volumeId: 1,
      locale: 'en-US',
      quantity: 3,
    })).rejects.toMatchObject({
      issues: [{
        productId: 'product-1',
        volumeId: 1,
        requested: 3,
        available: 2,
        isFreeSample: false,
      }],
    })
  })

  it('claims restoration once before incrementing order item pools', async () => {
    const tx = {
      order: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUnique: vi.fn().mockResolvedValue({
          items: [
            { productId: 'product-1', inventoryLocale: 'en-US', inventoryVolumeId: 1, quantity: 2, isFreeSample: false },
            { productId: 'product-2', inventoryLocale: 'en-US', inventoryVolumeId: null, quantity: 1, isFreeSample: true },
          ],
        }),
      },
      productVolume: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      productSampleInventory: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    }

    await expect(restoreOrderInventory(tx as never, 'order-1')).resolves.toBe(true)
    expect(tx.productVolume.updateMany).toHaveBeenCalledOnce()
    expect(tx.productSampleInventory.updateMany).toHaveBeenCalledOnce()

    tx.order.updateMany.mockResolvedValueOnce({ count: 0 })
    await expect(restoreOrderInventory(tx as never, 'order-1')).resolves.toBe(false)
    expect(tx.order.findUnique).toHaveBeenCalledOnce()
  })
})
