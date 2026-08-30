import { beforeEach, describe, expect, it, vi } from 'vitest'

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }))

vi.mock('@/lib/prisma', () => ({
  prisma: { product: { findMany } },
}))

import { getAvailableProductsForSample, getShoppingBagItems } from './shoppingBag'

describe('shopping bag inventory projections', () => {
  beforeEach(() => findMany.mockReset())

  it('keeps an item visible but unavailable when the active locale has no volume row', async () => {
    findMany.mockResolvedValueOnce([{
      id: 'product-1',
      slug: 'test',
      productImage: '/products/test.jpg',
      translations: [{ locale: 'en-US', name: 'Test' }],
      category: { translations: [{ locale: 'en-US', name: 'Category' }] },
      volumes: [],
    }])

    const items = await getShoppingBagItems([{ productId: 'product-1', volumeId: 1, quantity: 2 }], 'fr')

    expect(items).toEqual([expect.objectContaining({
      productId: 'product-1',
      price: 0,
      stock: 0,
      inventoryStatus: 'outOfStock',
      isAvailable: false,
    })])
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.objectContaining({
        volumes: expect.objectContaining({ where: { locale: 'fr-FR' } }),
      }),
    }))
  })

  it('returns sold-out samples as visible disabled options', async () => {
    findMany.mockResolvedValueOnce([{
      slug: 'test',
      translations: [{ locale: 'fr-FR', name: 'Essai' }],
      sampleInventory: [{ stock: 0 }],
    }])

    await expect(getAvailableProductsForSample('fr')).resolves.toEqual([{
      value: 'test',
      label: 'Essai',
      stock: 0,
      disabled: true,
    }])
  })
})
