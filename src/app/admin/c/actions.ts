'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createCollectionSchema } from './validation'
import { ZodError } from 'zod'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper function to delete image from filesystem
async function deleteImageFile(imageUrl: string) {
  try {
    // Only delete if it's in our uploads directory
    if (!imageUrl.startsWith('/uploads/collections/')) {
      return
    }

    const filepath = join(process.cwd(), 'public', imageUrl)
    if (existsSync(filepath)) {
      await unlink(filepath)
    }
  } catch (error) {
    console.error('Error deleting image file:', error)
    // Don't throw - we don't want to fail the main operation if file deletion fails
  }
}

// ============================================================================
// COLLECTION ACTIONS
// ============================================================================

export async function getCollections() {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        id: 'asc',
      },
    })
    return { success: true, data: collections }
  } catch (error) {
    console.error('Error fetching collections:', error)
    return { success: false, error: 'Failed to fetch collections' }
  }
}

export async function createCollection(data: unknown) {
  try {
    // Validate input
    const validated = createCollectionSchema.parse(data)

    // Check for duplicate slug
    const existing = await prisma.collection.findUnique({
      where: { slug: validated.slug },
    })

    if (existing) {
      return { success: false, error: 'A collection with this slug already exists' }
    }

    // Create collection
    const collection = await prisma.collection.create({
      data: {
        slug: validated.slug,
        coverImage1x1: validated.coverImage1x1,
        coverImage16x9: validated.coverImage16x9,
        translations: {
          create: validated.translations,
        },
      },
      include: {
        translations: true,
      },
    })

    revalidatePath('/admin/c')
    return { success: true, data: collection }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Error creating collection:', error)
    return { success: false, error: 'Failed to create collection' }
  }
}

export async function updateCollection(id: number, data: unknown, oldImages?: { desktop: string, mobile: string }) {
  try {
    // Validate input
    const validated = createCollectionSchema.parse(data)

    // Check for duplicate slug (excluding current collection)
    const existing = await prisma.collection.findFirst({
      where: {
        slug: validated.slug,
        id: { not: id }
      },
    })

    if (existing) {
      return { success: false, error: 'A collection with this slug already exists' }
    }

    // Delete existing translations and create new ones
    await prisma.collectionTranslation.deleteMany({
      where: { collectionId: id },
    })

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        slug: validated.slug,
        coverImage1x1: validated.coverImage1x1,
        coverImage16x9: validated.coverImage16x9,
        translations: {
          create: validated.translations,
        },
      },
      include: {
        translations: true,
      },
    })

    // Delete old images if they were replaced
    if (oldImages) {
      if (oldImages.desktop !== validated.coverImage1x1) {
        await deleteImageFile(oldImages.desktop)
      }
      if (oldImages.mobile !== validated.coverImage16x9) {
        await deleteImageFile(oldImages.mobile)
      }
    }

    revalidatePath('/admin/c')
    return { success: true, data: collection }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Error updating collection:', error)
    return { success: false, error: 'Failed to update collection' }
  }
}

export async function deleteCollection(id: number) {
  try {
    // Get collection data before deleting to access image URLs
    const collection = await prisma.collection.findUnique({
      where: { id },
      select: {
        coverImage1x1: true,
        coverImage16x9: true,
      },
    })

    if (!collection) {
      return { success: false, error: 'Collection not found' }
    }

    // Delete collection from database
    await prisma.collection.delete({
      where: { id },
    })

    // Delete associated images
    await deleteImageFile(collection.coverImage1x1)
    await deleteImageFile(collection.coverImage16x9)

    revalidatePath('/admin/c')
    return { success: true }
  } catch (error) {
    console.error('Error deleting collection:', error)
    return { success: false, error: 'Failed to delete collection' }
  }
}

// ============================================================================
// IMAGE UPLOAD ACTIONS
// ============================================================================

export async function uploadCollectionImage(formData: FormData) {
  try {
    const file = formData.get('file') as File
    const imageType = formData.get('imageType') as string // 'desktop' or 'mobile'

    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }
    }

    // Validate file size (max 1MB)
    const maxSize = 1 * 1024 * 1024 // 1MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds 1MB limit' }
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'collections')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${imageType}-${timestamp}.${extension}`
    const filepath = join(uploadDir, filename)

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/collections/${filename}`

    return { success: true, data: { url: publicUrl } }
  } catch (error) {
    console.error('Error uploading image:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

// Delete uploaded images (used when canceling create/edit operations)
export async function deleteCollectionImages(imageUrls: string[]) {
  try {
    for (const imageUrl of imageUrls) {
      await deleteImageFile(imageUrl)
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting images:', error)
    return { success: false, error: 'Failed to delete images' }
  }
}
