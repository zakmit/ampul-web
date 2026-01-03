import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(1, 'nameRequired').max(100, 'nameTooLong'),
  birthday: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  addressLine1: z.string().min(1, 'addressLine1Required').max(200, 'addressLine1TooLong'),
  addressLine2: z.string().max(200, 'addressLine2TooLong').optional().nullable(),
  city: z.string().min(1, 'cityRequired').max(100, 'cityTooLong'),
  region: z.string().max(100, 'regionTooLong').optional().nullable(),
  postalCode: z.string().min(1, 'postalCodeRequired').max(20, 'postalCodeTooLong'),
  country: z.string().min(1, 'countryRequired').max(100, 'countryTooLong'),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export type FormErrors = Partial<Record<keyof ProfileFormData, string>>
