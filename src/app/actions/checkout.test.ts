import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  sendEmail: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ prisma: { $transaction: mocks.transaction } }))
vi.mock('@/auth', () => ({ auth: vi.fn().mockResolvedValue(null) }))
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn().mockResolvedValue(() => '$') }))
vi.mock('@/lib/email', () => ({ sendOrderConfirmationEmail: mocks.sendEmail }))

import { createOrder } from './checkout'

const address = {
  recipientName: 'Guest',
  recipientPhone: '',
  addressLine1: '1 Test Street',
  addressLine2: '',
  city: 'Test City',
  region: '',
  postalCode: '10000',
  country: 'US',
}

function buildTransaction(stockUpdateCount = 1) {
  const orderCreate = vi.fn().mockResolvedValue({ id: 'order-1', orderNumber: 'ORDER-1' })
  const tx = {
    user: { findUnique: vi.fn() },
    product: {
      findMany: vi.fn().mockResolvedValue([{
        id: 'product-1',
        slug: 'test',
        productImage: '/products/test.jpg',
        translations: [{ locale: 'en-US', name: 'Test' }],
        category: { translations: [{ locale: 'en-US', name: 'Category' }] },
        volumes: [{
          volumeId: 1,
          locale: 'en-US',
          price: 100,
          stock: 2,
          volume: { value: '100ml', translations: [{ locale: 'en-US', displayName: '100 ml' }] },
        }],
      }]),
      findUnique: vi.fn(),
    },
    productVolume: {
      updateMany: vi.fn().mockResolvedValue({ count: stockUpdateCount }),
      findUnique: vi.fn().mockResolvedValue({ stock: 0 }),
    },
    productSampleInventory: { updateMany: vi.fn(), findUnique: vi.fn() },
    order: { create: orderCreate },
  }
  mocks.transaction.mockImplementationOnce((callback) => callback(tx))
  return { tx, orderCreate }
}

describe('createOrder inventory transaction', () => {
  beforeEach(() => {
    mocks.transaction.mockReset()
    mocks.sendEmail.mockReset()
  })

  it('deducts active-locale stock and snapshots its identity in the order', async () => {
    const { tx, orderCreate } = buildTransaction()

    const result = await createOrder(
      [{ productId: 'product-1', volumeId: 1, quantity: 2 }],
      null,
      address,
      'us',
      'guest@example.com'
    )

    expect(result).toMatchObject({ success: true, orderId: 'order-1' })
    expect(tx.productVolume.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ locale: 'en-US', stock: { gte: 2 } }),
    }))
    expect(orderCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        total: 200,
        items: {
          create: [expect.objectContaining({ inventoryLocale: 'en-US', inventoryVolumeId: 1, quantity: 2 })],
        },
      }),
    }))
  })

  it('returns an actionable issue and creates no order when stock changed', async () => {
    const { orderCreate } = buildTransaction(0)

    const result = await createOrder(
      [{ productId: 'product-1', volumeId: 1, quantity: 2 }],
      null,
      address,
      'us',
      'guest@example.com'
    )

    expect(result).toMatchObject({
      error: 'inventoryUnavailable',
      inventoryIssues: [expect.objectContaining({ productId: 'product-1', available: 0 })],
    })
    expect(orderCreate).not.toHaveBeenCalled()
  })
})
