'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { CreateProductSchema, UpdateProductSchema } from './validation'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

// Helper to ensure upload directory exists
async function ensureUploadDir() {
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
  return uploadDir
}

// Upload product image
export async function uploadProductImage(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
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

    const url = `/uploads/${filename}`
    return { success: true, data: { url } }
  } catch (error) {
    console.error('Error uploading image:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

// Delete product images
export async function deleteProductImages(imagePaths: string[]): Promise<ActionResult> {
  try {
    for (const imagePath of imagePaths) {
      // Only delete files in the uploads directory
      if (imagePath.startsWith('/uploads/')) {
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
    coverImageDesktop: string
    coverImageMobile: string
    productImage: string
    boxImage: string
    galleryImages: string[]
    translations: { locale: string; name: string; concept: string; sensations: string }[]
    volumes: { volumeId: number; locale: string; price: number; stock: number | null }[]
    tagIds: number[]
  }
): Promise<ActionResult> {
  try {
    // Validate input
    const validatedData = CreateProductSchema.parse(input)

    // Create product with all relations
    const product = await prisma.product.create({
      data: {
        slug: validatedData.slug,
        categoryId: validatedData.categoryId,
        collectionId: validatedData.collectionId,
        coverImageDesktop: validatedData.coverImageDesktop,
        coverImageMobile: validatedData.coverImageMobile,
        productImage: validatedData.productImage,
        boxImage: validatedData.boxImage,
        galleryImages: validatedData.galleryImages,
        translations: {
          create: validatedData.translations,
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
    return { success: true, data: product }
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
    coverImageDesktop?: string
    coverImageMobile?: string
    productImage?: string
    boxImage?: string
    galleryImages?: string[]
    translations?: { locale: string; name: string; concept: string; sensations: string }[]
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
    // Validate input
    const validatedData = UpdateProductSchema.parse({ ...input, id })

    // Determine which images to delete
    const imagesToDelete: string[] = []

    if (originalImages) {
      if (input.coverImageDesktop && input.coverImageDesktop !== originalImages.desktop && originalImages.desktop.startsWith('/uploads/')) {
        imagesToDelete.push(originalImages.desktop)
      }
      if (input.coverImageMobile && input.coverImageMobile !== originalImages.mobile && originalImages.mobile.startsWith('/uploads/')) {
        imagesToDelete.push(originalImages.mobile)
      }
      if (input.productImage && input.productImage !== originalImages.product && originalImages.product.startsWith('/uploads/')) {
        imagesToDelete.push(originalImages.product)
      }
      if (input.boxImage && input.boxImage !== originalImages.box && originalImages.box.startsWith('/uploads/')) {
        imagesToDelete.push(originalImages.box)
      }
      if (input.galleryImages) {
        const removedGalleryImages = originalImages.gallery.filter(img =>
          !input.galleryImages!.includes(img) && img.startsWith('/uploads/')
        )
        imagesToDelete.push(...removedGalleryImages)
      }
    }

    // Update product
    const updateData: any = {}

    if (input.slug !== undefined) updateData.slug = input.slug
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId
    if (input.collectionId !== undefined) updateData.collectionId = input.collectionId
    if (input.coverImageDesktop !== undefined) updateData.coverImageDesktop = input.coverImageDesktop
    if (input.coverImageMobile !== undefined) updateData.coverImageMobile = input.coverImageMobile
    if (input.productImage !== undefined) updateData.productImage = input.productImage
    if (input.boxImage !== undefined) updateData.boxImage = input.boxImage
    if (input.galleryImages !== undefined) updateData.galleryImages = input.galleryImages

    // Handle translations update
    if (input.translations) {
      updateData.translations = {
        deleteMany: {},
        create: input.translations,
      }
    }

    // Handle volumes update
    if (input.volumes) {
      updateData.volumes = {
        deleteMany: {},
        create: input.volumes,
      }
    }

    // Handle tags update
    if (input.tagIds) {
      updateData.tags = {
        deleteMany: {},
        create: input.tagIds.map(tagId => ({ tagId })),
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
    return { success: true, data: product }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update product' }
  }
}

// Delete product
export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    // Get product to find images to delete
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        coverImageDesktop: true,
        coverImageMobile: true,
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
      product.coverImageDesktop,
      product.coverImageMobile,
      product.productImage,
      product.boxImage,
      ...product.galleryImages,
    ].filter(img => img.startsWith('/uploads/'))

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
