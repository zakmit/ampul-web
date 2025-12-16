import { z } from 'zod'

// Slug validation - URL-safe format
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

// Image URL validation
const imageUrlSchema = z.string()
  .min(1, 'Image URL is required')
  .max(500, 'Image URL must be 500 characters or less')
  .refine(
    (url) => {
      // Allow relative paths starting with / or http/https URLs
      return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')
    },
    'Image URL must be a valid path starting with / or a valid HTTP/HTTPS URL'
  )

// Collection translation validation
const collectionTranslationSchema = z.object({
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
    path: ['name'],
  }
)

export const createCollectionSchema = z.object({
  slug: slugSchema,
  coverImageDesktop: imageUrlSchema,
  coverImageMobile: imageUrlSchema,
  translations: z.array(collectionTranslationSchema)
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

export const updateCollectionSchema = createCollectionSchema.extend({
  id: z.number().int().positive(),
})

// Type exports for use in components
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>
