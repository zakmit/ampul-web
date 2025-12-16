import { z } from 'zod'

// Schema for product translation
const ProductTranslationSchema = z.object({
  locale: z.string(),
  name: z.string().min(1, 'Product name is required'),
  concept: z.string().min(1, 'Concept is required'),
  sensations: z.string().min(1, 'Sensations is required'),
})

// Schema for product volume pricing
const ProductVolumeSchema = z.object({
  volumeId: z.number(),
  locale: z.string(),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().int().nullable(),
})

// Schema for creating a product
export const CreateProductSchema = z.object({
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  categoryId: z.number().int().positive('Category is required'),
  collectionId: z.number().int().positive('Collection is required'),
  coverImageDesktop: z.string().min(1, '1:1 Promotional image is required'),
  coverImageMobile: z.string().min(1, '16:9 Promotional image is required'),
  productImage: z.string().min(1, 'Product image is required'),
  boxImage: z.string().min(1, 'Box image is required'),
  galleryImages: z.array(z.string()),
  translations: z.array(ProductTranslationSchema).min(1, 'At least one translation is required'),
  volumes: z.array(ProductVolumeSchema).min(1, 'At least one volume is required'),
  tagIds: z.array(z.number().int()),
})

// Schema for updating a product
export const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string(),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
