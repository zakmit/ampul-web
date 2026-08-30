import { describe, expect, it } from 'vitest'
import { CreateProductSchema } from './validation'

const baseProduct = {
  slug: 'test-product',
  categoryId: 1,
  collectionId: 1,
  coverImage1x1: '/products/test.jpg',
  coverImage16x9: '/products/test.jpg',
  productImage: '/products/test.jpg',
  boxImage: '/products/test.jpg',
  galleryImages: [],
  translations: [{ locale: 'en-US' as const, name: 'Test', concept: 'Concept', sensations: 'Sensation' }],
  volumes: [{ volumeId: 1, locale: 'en-US' as const, price: 100, stock: 0 }],
  sampleInventory: [
    { locale: 'en-US' as const, stock: 0 },
    { locale: 'fr-FR' as const, stock: 30 },
    { locale: 'zh-TW' as const, stock: 30 },
  ],
  tagIds: [],
}

describe('product inventory validation', () => {
  it('accepts zero stock for regular products and samples', () => {
    expect(CreateProductSchema.safeParse(baseProduct).success).toBe(true)
  })

  it.each([-1, 1.5])('rejects invalid regular stock %s', (stock) => {
    const result = CreateProductSchema.safeParse({
      ...baseProduct,
      volumes: [{ ...baseProduct.volumes[0], stock }],
    })
    expect(result.success).toBe(false)
  })

  it('requires sample inventory for every supported locale', () => {
    const result = CreateProductSchema.safeParse({
      ...baseProduct,
      sampleInventory: baseProduct.sampleInventory.slice(0, 2),
    })
    expect(result.success).toBe(false)
  })

  it('rejects duplicate sample locales', () => {
    const result = CreateProductSchema.safeParse({
      ...baseProduct,
      sampleInventory: [
        baseProduct.sampleInventory[0],
        baseProduct.sampleInventory[0],
        baseProduct.sampleInventory[2],
      ],
    })
    expect(result.success).toBe(false)
  })
})
