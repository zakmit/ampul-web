import { z } from 'zod'
import type { OrderStatus } from '@/generated/prisma'

// Orders in these states are historical records - reopening one would ship stock
// that has already been restored, so all edits are blocked.
export const TERMINAL_ORDER_STATUSES: OrderStatus[] = ['CANCELLED', 'REFUNDED']

export function isOrderLocked(status: OrderStatus): boolean {
  return TERMINAL_ORDER_STATUSES.includes(status)
}

export function orderLockedError(status: OrderStatus): string {
  return `Order is ${status.toLowerCase()} and can no longer be edited`
}

export const addressUpdateSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required').max(100, 'Name is too long'),
  recipientPhone: z.string().max(20, 'Phone number is too long').optional().nullable(),
  shippingLine1: z.string().min(1, 'Address line 1 is required').max(200, 'Address is too long'),
  shippingLine2: z.string().max(200, 'Address is too long').optional().nullable(),
  shippingCity: z.string().min(1, 'City is required').max(100, 'City name is too long'),
  shippingRegion: z.string().max(100, 'Region name is too long').optional().nullable(),
  shippingPostal: z.string().min(1, 'Postal code is required').max(20, 'Postal code is too long'),
  shippingCountry: z.string().min(1, 'Country is required').max(100, 'Country name is too long'),
})

export type AddressUpdateData = z.infer<typeof addressUpdateSchema>
