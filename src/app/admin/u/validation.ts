import { z } from 'zod'

export const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  birthday: z.string().optional().nullable(),
  phone: z.string().max(20, 'Phone number is too long').optional().nullable(),
})

export type UserUpdateData = z.infer<typeof userUpdateSchema>

export const userAddressUpdateSchema = z.object({
  recipientName: z.string().max(100, 'Name is too long').optional().nullable(),
  recipientPhone: z.string().max(20, 'Phone number is too long').optional().nullable(),
  addressLine1: z.string().min(1, 'Address line 1 is required').max(200, 'Address is too long'),
  addressLine2: z.string().max(200, 'Address is too long').optional().nullable(),
  city: z.string().min(1, 'City is required').max(100, 'City name is too long'),
  region: z.string().max(100, 'Region name is too long').optional().nullable(),
  postalCode: z.string().min(1, 'Postal code is required').max(20, 'Postal code is too long'),
  country: z.string().min(1, 'Country is required').max(100, 'Country name is too long'),
})

export type UserAddressUpdateData = z.infer<typeof userAddressUpdateSchema>
