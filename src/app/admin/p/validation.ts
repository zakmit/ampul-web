import { z } from 'zod'

// Validation constants
const MAX_PRODUCT_NAME_LENGTH = 100
const MAX_CONCEPT_LENGTH = 500
const MAX_SENSATIONS_LENGTH = 200
const MAX_SLUG_LENGTH = 100
const MIN_SLUG_LENGTH = 2
const MAX_PRICE = 999999.99
const MIN_PRICE = 0.01
const MAX_STOCK = 999999
const MIN_STOCK = 0
const MAX_GALLERY_IMAGES = 10

// Supported locales
const SUPPORTED_LOCALES = ['en-US', 'fr-FR', 'zh-TW'] as const

// Schema for required translation (en-US)
const RequiredProductTranslationSchema = z.object({
  locale: z.literal('en-US'),
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(MAX_PRODUCT_NAME_LENGTH, `Product name must not exceed ${MAX_PRODUCT_NAME_LENGTH} characters`)
    .trim(),
  concept: z
    .string()
    .min(1, 'Concept is required')
    .max(MAX_CONCEPT_LENGTH, `Concept must not exceed ${MAX_CONCEPT_LENGTH} characters`)
    .trim(),
  sensations: z
    .string()
    .min(1, 'Sensations is required')
    .max(MAX_SENSATIONS_LENGTH, `Sensations must not exceed ${MAX_SENSATIONS_LENGTH} characters`)
    .trim(),
})

// Schema for optional translations (fr-FR, zh-TW)
const OptionalProductTranslationSchema = z.object({
  locale: z.enum(['fr-FR', 'zh-TW'], {
    message: 'Invalid locale. Must be fr-FR or zh-TW',
  }),
  name: z
    .string()
    .max(MAX_PRODUCT_NAME_LENGTH, `Product name must not exceed ${MAX_PRODUCT_NAME_LENGTH} characters`)
    .trim()
    .optional(),
  concept: z
    .string()
    .max(MAX_CONCEPT_LENGTH, `Concept must not exceed ${MAX_CONCEPT_LENGTH} characters`)
    .trim()
    .optional(),
  sensations: z
    .string()
    .max(MAX_SENSATIONS_LENGTH, `Sensations must not exceed ${MAX_SENSATIONS_LENGTH} characters`)
    .trim()
    .optional(),
})

// Combined schema for any product translation
const ProductTranslationSchema = z.union([
  RequiredProductTranslationSchema,
  OptionalProductTranslationSchema,
])

// Schema for product volume pricing
const ProductVolumeSchema = z.object({
  volumeId: z
    .number()
    .int('Volume ID must be an integer')
    .positive('Volume ID must be positive'),
  locale: z.enum(SUPPORTED_LOCALES, {
    message: 'Invalid locale. Must be one of: en-US, fr-FR, zh-TW',
  }),
  price: z
    .number()
    .min(MIN_PRICE, `Price must be at least ${MIN_PRICE}`)
    .max(MAX_PRICE, `Price must not exceed ${MAX_PRICE}`)
    .refine((val) => {
      // Check if price has at most 2 decimal places
      const decimalPlaces = (val.toString().split('.')[1] || '').length
      return decimalPlaces <= 2
    }, 'Price must have at most 2 decimal places'),
  stock: z
    .number()
    .int('Stock must be an integer')
    .min(MIN_STOCK, `Stock must be at least ${MIN_STOCK}`)
    .max(MAX_STOCK, `Stock must not exceed ${MAX_STOCK}`)
    .nullable(),
})

// Schema for image URL validation
const ImageUrlSchema = z
  .string()
  .min(1, 'Image is required')
  .refine(
    (url) => {
      // Allow /uploads/products/ paths (uploaded files) or /products/ paths (static files)
      return url.startsWith('/uploads/products/') || url.startsWith('/products/')
    },
    'Image URL must start with /uploads/products/ or /products/'
  )
  .refine(
    (url) => {
      // Check valid image extensions
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp']
      return validExtensions.some((ext) => url.toLowerCase().endsWith(ext))
    },
    'Image must be a valid format (jpg, jpeg, png, or webp)'
  )

// Schema for creating a product
export const CreateProductSchema = z.object({
  slug: z
    .string()
    .min(MIN_SLUG_LENGTH, `Slug must be at least ${MIN_SLUG_LENGTH} characters`)
    .max(MAX_SLUG_LENGTH, `Slug must not exceed ${MAX_SLUG_LENGTH} characters`)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .regex(/^[a-z]/, 'Slug must start with a letter')
    .regex(/[a-z0-9]$/, 'Slug must end with a letter or number')
    .refine((slug) => !slug.includes('--'), 'Slug must not contain consecutive hyphens')
    .trim(),
  categoryId: z
    .number()
    .int('Category ID must be an integer')
    .positive('Category is required'),
  collectionId: z
    .number()
    .int('Collection ID must be an integer')
    .positive('Collection is required'),
  coverImageDesktop: ImageUrlSchema,
  coverImageMobile: ImageUrlSchema,
  productImage: ImageUrlSchema,
  boxImage: ImageUrlSchema,
  galleryImages: z
    .array(ImageUrlSchema)
    .max(MAX_GALLERY_IMAGES, `Gallery can have at most ${MAX_GALLERY_IMAGES} images`)
    .default([]),
  translations: z
    .array(ProductTranslationSchema)
    .min(1, 'At least one translation is required')
    .max(SUPPORTED_LOCALES.length, `Maximum ${SUPPORTED_LOCALES.length} translations allowed`)
    .refine(
      (translations) => {
        // Check for duplicate locales
        const locales = translations.map((t) => t.locale)
        return new Set(locales).size === locales.length
      },
      'Duplicate locales are not allowed'
    )
    .refine(
      (translations) => {
        // Ensure en-US translation is always present
        return translations.some((t) => t.locale === 'en-US')
      },
      'en-US translation is required'
    ),
  volumes: z
    .array(ProductVolumeSchema)
    .min(1, 'At least one volume pricing is required')
    .refine(
      (volumes) => {
        // Check for duplicate volume-locale combinations
        const combinations = volumes.map((v) => `${v.volumeId}-${v.locale}`)
        return new Set(combinations).size === combinations.length
      },
      'Duplicate volume-locale combinations are not allowed'
    ),
  tagIds: z
    .array(z.number().int('Tag ID must be an integer').positive('Tag ID must be positive'))
    .max(20, 'Maximum 20 tags allowed')
    .default([]),
})

// Schema for updating a product
export const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string().min(1, 'Product ID is required'),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>

// Export validation constants for use in forms
export const VALIDATION_LIMITS = {
  MAX_PRODUCT_NAME_LENGTH,
  MAX_CONCEPT_LENGTH,
  MAX_SENSATIONS_LENGTH,
  MAX_SLUG_LENGTH,
  MIN_SLUG_LENGTH,
  MAX_PRICE,
  MIN_PRICE,
  MAX_STOCK,
  MIN_STOCK,
  MAX_GALLERY_IMAGES,
  SUPPORTED_LOCALES,
} as const
