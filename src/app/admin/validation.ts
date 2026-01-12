import { z } from 'zod'

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
