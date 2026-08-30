import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  transaction: vi.fn(),
  restoreOrderInventory: vi.fn(),
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: mocks.findUnique,
      update: mocks.update,
      updateMany: mocks.updateMany,
    },
    $transaction: mocks.transaction,
  },
}))
vi.mock('@/auth', () => ({ auth: mocks.auth }))
vi.mock('@/lib/inventory', () => ({ restoreOrderInventory: mocks.restoreOrderInventory }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { updateOrderStatus, updateOrderAddress, updateTrackingCode } from './actions'

const address = {
  recipientName: 'Recipient',
  recipientPhone: '',
  shippingLine1: '1 Test Street',
  shippingLine2: '',
  shippingCity: 'Test City',
  shippingRegion: '',
  shippingPostal: '10000',
  shippingCountry: 'US',
}

describe('terminal order edit lock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.mockResolvedValue({ user: { role: 'admin' } })
    // Run the transaction callback against a tx exposing the same order mocks.
    mocks.transaction.mockImplementation((callback) =>
      callback({ order: { updateMany: mocks.updateMany, update: mocks.update } })
    )
    mocks.updateMany.mockResolvedValue({ count: 1 })
  })

  for (const status of ['CANCELLED', 'REFUNDED'] as const) {
    describe(`when the order is ${status}`, () => {
      beforeEach(() => {
        mocks.findUnique.mockResolvedValue({ status })
      })

      it('refuses a status change and leaves inventory untouched', async () => {
        const result = await updateOrderStatus('order-1', 'SHIPPED')

        expect(result.success).toBe(false)
        expect(result.error).toContain('can no longer be edited')
        expect(mocks.updateMany).not.toHaveBeenCalled()
        expect(mocks.restoreOrderInventory).not.toHaveBeenCalled()
      })

      it('refuses an address update', async () => {
        const result = await updateOrderAddress('order-1', address)

        expect(result.success).toBe(false)
        expect(result.error).toContain('can no longer be edited')
        expect(mocks.update).not.toHaveBeenCalled()
      })

      it('refuses a tracking code update', async () => {
        const result = await updateTrackingCode('order-1', 'TRACK-123')

        expect(result.success).toBe(false)
        expect(result.error).toContain('can no longer be edited')
        expect(mocks.update).not.toHaveBeenCalled()
      })
    })
  }

  describe('when the order is still open', () => {
    beforeEach(() => {
      mocks.findUnique.mockResolvedValue({ status: 'PENDING' })
    })

    it('allows a status change', async () => {
      const result = await updateOrderStatus('order-1', 'SHIPPED')

      expect(result.success).toBe(true)
      expect(mocks.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'SHIPPED' } })
      )
    })

    it('restores inventory when cancelling', async () => {
      const result = await updateOrderStatus('order-1', 'CANCELLED')

      expect(result.success).toBe(true)
      expect(mocks.restoreOrderInventory).toHaveBeenCalledWith(expect.anything(), 'order-1')
    })

    it('allows an address update', async () => {
      const result = await updateOrderAddress('order-1', address)

      expect(result.success).toBe(true)
      expect(mocks.update).toHaveBeenCalled()
    })
  })

  it('does not restore inventory when a concurrent update already finalized the order', async () => {
    mocks.findUnique.mockResolvedValue({ status: 'PENDING' })
    // The guarded write matches no rows because the status changed underneath us.
    mocks.updateMany.mockResolvedValue({ count: 0 })

    const result = await updateOrderStatus('order-1', 'CANCELLED')

    expect(result.success).toBe(false)
    expect(mocks.restoreOrderInventory).not.toHaveBeenCalled()
  })
})
