import { z } from 'zod'

// Slug validation - URL-safe format
// - lowercase letters (a-z)
// - numbers (0-9)
// - hyphens (-)
// - no whitespace, no special characters
// - must start and end with alphanumeric
const slugSchema = z.string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be 100 characters or less')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase letters, numbers, and hyphens only. Must start and end with alphanumeric.'
  )
  .transform((val) => val.toLowerCase().trim())

// Locale validation - only allow supported locales
const localeSchema = z.enum(['en-US', 'fr-FR', 'zh-TW'])

// Category validation schemas
const categoryTranslationSchema = z.object({
  locale: localeSchema,
  name: z.string()
    .max(200, 'Name must be 200 characters or less')
    .trim(),
  description: z.string()
    .max(2000, 'Description must be 2000 characters or less')
    .trim(),
}).refine(
  (data) => {
    // Only require name and description for en-US locale
    if (data.locale === 'en-US') {
      return data.name.length > 0 && data.description.length > 0
    }
    return true
  },
  {
    message: 'Name and description are required for English (en-US) translation',
    path: ['name'], // Show error on name field
  }
)

export const createCategorySchema = z.object({
  slug: slugSchema,
  translations: z.array(categoryTranslationSchema)
    .min(1, 'At least one translation is required')
    .max(3, 'Maximum 3 translations allowed')
    .refine(
      (translations) => {
        // Check for duplicate locales
        const locales = translations.map(t => t.locale)
        return new Set(locales).size === locales.length
      },
      { message: 'Duplicate locales are not allowed' }
    )
    .refine(
      (translations) => {
        // Ensure en-US translation exists (required as fallback)
        return translations.some(t => t.locale === 'en-US')
      },
      { message: 'English (en-US) translation is required' }
    ),
})

export const updateCategorySchema = createCategorySchema.extend({
  id: z.number().int().positive(),
})

// Tag validation schemas
const tagTranslationSchema = z.object({
  locale: localeSchema,
  name: z.string()
    .max(100, 'Name must be 100 characters or less')
    .trim(),
}).refine(
  (data) => {
    // Only require name for en-US locale
    if (data.locale === 'en-US') {
      return data.name.length > 0
    }
    return true
  },
  {
    message: 'Name is required for English (en-US) translation',
    path: ['name'],
  }
)

export const createTagSchema = z.object({
  slug: slugSchema,
  translations: z.array(tagTranslationSchema)
    .min(1, 'At least one translation is required')
    .max(3, 'Maximum 3 translations allowed')
    .refine(
      (translations) => {
        const locales = translations.map(t => t.locale)
        return new Set(locales).size === locales.length
      },
      { message: 'Duplicate locales are not allowed' }
    )
    .refine(
      (translations) => {
        return translations.some(t => t.locale === 'en-US')
      },
      { message: 'English (en-US) translation is required' }
    ),
})

export const updateTagSchema = createTagSchema.extend({
  id: z.number().int().positive(),
})

// Volume validation schemas
const volumeTranslationSchema = z.object({
  locale: localeSchema,
  displayName: z.string()
    .max(50, 'Display name must be 50 characters or less')
    .trim(),
}).refine(
  (data) => {
    // Only require displayName for en-US locale
    if (data.locale === 'en-US') {
      return data.displayName.length > 0
    }
    return true
  },
  {
    message: 'Display name is required for English (en-US) translation',
    path: ['displayName'],
  }
)

export const createVolumeSchema = z.object({
  value: z.string()
    .min(1, 'Value is required')
    .max(20, 'Value must be 20 characters or less')
    .regex(
      /^[0-9]+\s*(ml|ML|l|L|oz|OZ|g|G|kg|KG)$/,
      'Value must be a number followed by a unit (ml, l, oz, g, kg)'
    )
    .transform((val) => val.toLowerCase().replace(/\s+/g, '')), // Normalize: "100 ml" -> "100ml"
  translations: z.array(volumeTranslationSchema)
    .min(1, 'At least one translation is required')
    .max(3, 'Maximum 3 translations allowed')
    .refine(
      (translations) => {
        const locales = translations.map(t => t.locale)
        return new Set(locales).size === locales.length
      },
      { message: 'Duplicate locales are not allowed' }
    )
    .refine(
      (translations) => {
        return translations.some(t => t.locale === 'en-US')
      },
      { message: 'English (en-US) translation is required' }
    ),
})

export const updateVolumeSchema = createVolumeSchema.extend({
  id: z.number().int().positive(),
})

// Type exports for use in components
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
export type CreateVolumeInput = z.infer<typeof createVolumeSchema>
export type UpdateVolumeInput = z.infer<typeof updateVolumeSchema>
