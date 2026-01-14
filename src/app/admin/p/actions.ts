'use server'

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma/client'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { CreateProductSchema, UpdateProductSchema } from './validation'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

// Helper to convert Decimal to number for client serialization
function serializeProduct<T extends { volumes?: Array<{ price: number | string | { toNumber?: () => number } }> }>(product: T) {
  return {
    ...product,
    volumes: product.volumes?.map((v) => ({
      ...v,
      price: typeof v.price === 'object' && v.price && 'toNumber' in v.price && v.price.toNumber ? v.price.toNumber() : Number(v.price),
    })) || [],
  }
}

// Helper to ensure upload directory exists
async function ensureUploadDir() {
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'products')
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
  return uploadDir
}

// Upload product image
export async function uploadProductImage(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    // Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const file = formData.get('file') as File
    const imageType = formData.get('imageType') as string

    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    const uploadDir = await ensureUploadDir()
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const extension = file.name.split('.').pop()
    const filename = `product-${imageType}-${uniqueSuffix}.${extension}`
    const filepath = join(uploadDir, filename)

    await writeFile(filepath, buffer)

    const url = `/uploads/products/${filename}`
    return { success: true, data: { url } }
  } catch (error) {
    console.error('Error uploading image:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

// Delete product images
export async function deleteProductImages(imagePaths: string[]): Promise<ActionResult> {
  try {
    // Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    for (const imagePath of imagePaths) {
      // Only delete files in the uploads/products directory
      if (imagePath.startsWith('/uploads/products/')) {
        const filepath = join(process.cwd(), 'public', imagePath)
        if (existsSync(filepath)) {
          await unlink(filepath)
        }
      }
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting images:', error)
    return { success: false, error: 'Failed to delete images' }
  }
}

// Create product
export async function createProduct(
  input: {
    slug: string
    categoryId: number
    collectionId: number
    coverImage1x1: string
    coverImage16x9: string
    productImage: string
    boxImage: string
    galleryImages: string[]
    translations: { locale: string; name?: string; concept?: string; sensations?: string }[]
    volumes: { volumeId: number; locale: string; price: number; stock: number | null }[]
    tagIds: number[]
  }
): Promise<ActionResult> {
  try {
    // Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate input
    const validatedData = CreateProductSchema.parse(input)

    // Create product with all relations
    const product = await prisma.product.create({
      data: {
        slug: validatedData.slug,
        categoryId: validatedData.categoryId,
        collectionId: validatedData.collectionId,
        coverImage1x1: validatedData.coverImage1x1,
        coverImage16x9: validatedData.coverImage16x9,
        productImage: validatedData.productImage,
        boxImage: validatedData.boxImage,
        galleryImages: validatedData.galleryImages,
        translations: {
          create: validatedData.translations.map(t => ({
            locale: t.locale,
            name: t.name || '',
            concept: t.concept || '',
            sensations: t.sensations || '',
          })),
        },
        volumes: {
          create: validatedData.volumes,
        },
        tags: {
          create: validatedData.tagIds.map(tagId => ({
            tagId,
          })),
        },
      },
      include: {
        category: {
          include: {
            translations: true,
          },
        },
        collection: {
          include: {
            translations: true,
          },
        },
        translations: true,
        volumes: {
          include: {
            volume: {
              include: {
                translations: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    })

    revalidatePath('/admin/p')
    return { success: true, data: serializeProduct(product) }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create product' }
  }
}

// Update product
export async function updateProduct(
  id: string,
  input: {
    slug?: string
    categoryId?: number
    collectionId?: number
    coverImage1x1?: string
    coverImage16x9?: string
    productImage?: string
    boxImage?: string
    galleryImages?: string[]
    translations?: { locale: string; name?: string; concept?: string; sensations?: string }[]
    volumes?: { volumeId: number; locale: string; price: number; stock: number | null }[]
    tagIds?: number[]
  },
  originalImages?: {
    desktop: string
    mobile: string
    product: string
    box: string
    gallery: string[]
  }
): Promise<ActionResult> {
  try {
    // Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate and sanitize input
    const validatedData = UpdateProductSchema.parse({ ...input, id })

    // Determine which images to delete (use original input for image comparison)
    const imagesToDelete: string[] = []

    if (originalImages) {
      if (validatedData.coverImage1x1 && validatedData.coverImage1x1 !== originalImages.desktop && originalImages.desktop.startsWith('/uploads/products/')) {
        imagesToDelete.push(originalImages.desktop)
      }
      if (validatedData.coverImage16x9 && validatedData.coverImage16x9 !== originalImages.mobile && originalImages.mobile.startsWith('/uploads/products/')) {
        imagesToDelete.push(originalImages.mobile)
      }
      if (validatedData.productImage && validatedData.productImage !== originalImages.product && originalImages.product.startsWith('/uploads/products/')) {
        imagesToDelete.push(originalImages.product)
      }
      if (validatedData.boxImage && validatedData.boxImage !== originalImages.box && originalImages.box.startsWith('/uploads/products/')) {
        imagesToDelete.push(originalImages.box)
      }
      if (validatedData.galleryImages) {
        const removedGalleryImages = originalImages.gallery.filter(img =>
          !validatedData.galleryImages!.includes(img) && img.startsWith('/uploads/products/')
        )
        imagesToDelete.push(...removedGalleryImages)
      }
    }

    // Build update data dynamically using validated data
    // Using Prisma.ProductUncheckedUpdateInput allows us to use IDs directly
    const updateData: Prisma.ProductUncheckedUpdateInput = {}

    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug
    if (validatedData.categoryId !== undefined) updateData.categoryId = validatedData.categoryId
    if (validatedData.collectionId !== undefined) updateData.collectionId = validatedData.collectionId
    if (validatedData.coverImage1x1 !== undefined) updateData.coverImage1x1 = validatedData.coverImage1x1
    if (validatedData.coverImage16x9 !== undefined) updateData.coverImage16x9 = validatedData.coverImage16x9
    if (validatedData.productImage !== undefined) updateData.productImage = validatedData.productImage
    if (validatedData.boxImage !== undefined) updateData.boxImage = validatedData.boxImage
    if (validatedData.galleryImages !== undefined) updateData.galleryImages = validatedData.galleryImages

    // Handle translations update
    if (validatedData.translations) {
      updateData.translations = {
        deleteMany: {},
        create: validatedData.translations.map(t => ({
          locale: t.locale,
          name: t.name || '',
          concept: t.concept || '',
          sensations: t.sensations || '',
        })),
      }
    }

    // Handle volumes update
    if (validatedData.volumes) {
      updateData.volumes = {
        deleteMany: {},
        create: validatedData.volumes,
      }
    }

    // Handle tags update
    if (validatedData.tagIds) {
      updateData.tags = {
        deleteMany: {},
        create: validatedData.tagIds.map(tagId => ({ tagId })),
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          include: {
            translations: true,
          },
        },
        collection: {
          include: {
            translations: true,
          },
        },
        translations: true,
        volumes: {
          include: {
            volume: {
              include: {
                translations: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    })

    // Delete old images after successful update
    if (imagesToDelete.length > 0) {
      await deleteProductImages(imagesToDelete)
    }

    revalidatePath('/admin/p')
    return { success: true, data: serializeProduct(product) }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update product' }
  }
}

// Delete product
export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    // Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Get product to find images to delete
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        coverImage1x1: true,
        coverImage16x9: true,
        productImage: true,
        boxImage: true,
        galleryImages: true,
      },
    })

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    // Delete product (cascades to translations, volumes, and tags)
    await prisma.product.delete({
      where: { id },
    })

    // Delete images
    const imagesToDelete = [
      product.coverImage1x1,
      product.coverImage16x9,
      product.productImage,
      product.boxImage,
      ...product.galleryImages,
    ].filter(img => img.startsWith('/uploads/products/'))

    if (imagesToDelete.length > 0) {
      await deleteProductImages(imagesToDelete)
    }

    revalidatePath('/admin/p')
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}
