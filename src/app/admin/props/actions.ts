'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import {
  createCategorySchema,
  createTagSchema,
  createVolumeSchema
} from './validation'
import { ZodError } from 'zod'

// ============================================================================
// CATEGORY ACTIONS
// ============================================================================

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        id: 'asc',
      },
    })
    return { success: true, data: categories }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { success: false, error: 'Failed to fetch categories' }
  }
}

export async function createCategory(data: unknown) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate input
    const validated = createCategorySchema.parse(data)

    // Check for duplicate slug
    const existing = await prisma.category.findUnique({
      where: { slug: validated.slug },
    })

    if (existing) {
      return { success: false, error: 'A category with this slug already exists' }
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        slug: validated.slug,
        translations: {
          create: validated.translations,
        },
      },
      include: {
        translations: true,
      },
    })

    revalidatePath('/admin/props')
    return { success: true, data: category }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Error creating category:', error)
    return { success: false, error: 'Failed to create category' }
  }
}

export async function updateCategory(id: number, data: unknown) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate input
    const validated = createCategorySchema.parse(data)

    // Check for duplicate slug (excluding current category)
    const existing = await prisma.category.findFirst({
      where: {
        slug: validated.slug,
        id: { not: id }
      },
    })

    if (existing) {
      return { success: false, error: 'A category with this slug already exists' }
    }

    // Delete existing translations and create new ones
    await prisma.categoryTranslation.deleteMany({
      where: { categoryId: id },
    })

    const category = await prisma.category.update({
      where: { id },
      data: {
        slug: validated.slug,
        translations: {
          create: validated.translations,
        },
      },
      include: {
        translations: true,
      },
    })

    revalidatePath('/admin/props')
    return { success: true, data: category }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Error updating category:', error)
    return { success: false, error: 'Failed to update category' }
  }
}

export async function deleteCategory(id: number) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.category.delete({
      where: { id },
    })

    revalidatePath('/admin/props')
    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: 'Failed to delete category' }
  }
}

// ============================================================================
// TAG ACTIONS
// ============================================================================

export async function getTags() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        id: 'asc',
      },
    })
    return { success: true, data: tags }
  } catch (error) {
    console.error('Error fetching tags:', error)
    return { success: false, error: 'Failed to fetch tags' }
  }
}

export async function createTag(data: unknown) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate input
    const validated = createTagSchema.parse(data)

    // Check for duplicate slug
    const existing = await prisma.tag.findUnique({
      where: { slug: validated.slug },
    })

    if (existing) {
      return { success: false, error: 'A tag with this slug already exists' }
    }

    // Create tag
    const tag = await prisma.tag.create({
      data: {
        slug: validated.slug,
        translations: {
          create: validated.translations,
        },
      },
      include: {
        translations: true,
      },
    })

    revalidatePath('/admin/props')
    return { success: true, data: tag }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Error creating tag:', error)
    return { success: false, error: 'Failed to create tag' }
  }
}

export async function updateTag(id: number, data: unknown) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate input
    const validated = createTagSchema.parse(data)

    // Check for duplicate slug (excluding current tag)
    const existing = await prisma.tag.findFirst({
      where: {
        slug: validated.slug,
        id: { not: id }
      },
    })

    if (existing) {
      return { success: false, error: 'A tag with this slug already exists' }
    }

    // Delete existing translations and create new ones
    await prisma.tagTranslation.deleteMany({
      where: { tagId: id },
    })

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        slug: validated.slug,
        translations: {
          create: validated.translations,
        },
      },
      include: {
        translations: true,
      },
    })

    revalidatePath('/admin/props')
    return { success: true, data: tag }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Error updating tag:', error)
    return { success: false, error: 'Failed to update tag' }
  }
}

export async function deleteTag(id: number) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.tag.delete({
      where: { id },
    })

    revalidatePath('/admin/props')
    return { success: true }
  } catch (error) {
    console.error('Error deleting tag:', error)
    return { success: false, error: 'Failed to delete tag' }
  }
}

// ============================================================================
// VOLUME ACTIONS
// ============================================================================

export async function getVolumes() {
  try {
    const volumes = await prisma.volume.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        id: 'asc',
      },
    })
    return { success: true, data: volumes }
  } catch (error) {
    console.error('Error fetching volumes:', error)
    return { success: false, error: 'Failed to fetch volumes' }
  }
}

export async function createVolume(data: unknown) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate input
    const validated = createVolumeSchema.parse(data)

    // Check for duplicate value
    const existing = await prisma.volume.findUnique({
      where: { value: validated.value },
    })

    if (existing) {
      return { success: false, error: 'A volume with this value already exists' }
    }

    // Create volume
    const volume = await prisma.volume.create({
      data: {
        value: validated.value,
        translations: {
          create: validated.translations,
        },
      },
      include: {
        translations: true,
      },
    })

    revalidatePath('/admin/props')
    return { success: true, data: volume }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Error creating volume:', error)
    return { success: false, error: 'Failed to create volume' }
  }
}

export async function updateVolume(id: number, data: unknown) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate input
    const validated = createVolumeSchema.parse(data)

    // Check for duplicate value (excluding current volume)
    const existing = await prisma.volume.findFirst({
      where: {
        value: validated.value,
        id: { not: id }
      },
    })

    if (existing) {
      return { success: false, error: 'A volume with this value already exists' }
    }

    // Delete existing translations and create new ones
    await prisma.volumeTranslation.deleteMany({
      where: { volumeId: id },
    })

    const volume = await prisma.volume.update({
      where: { id },
      data: {
        value: validated.value,
        translations: {
          create: validated.translations,
        },
      },
      include: {
        translations: true,
      },
    })

    revalidatePath('/admin/props')
    return { success: true, data: volume }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Error updating volume:', error)
    return { success: false, error: 'Failed to update volume' }
  }
}

export async function deleteVolume(id: number) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.volume.delete({
      where: { id },
    })

    revalidatePath('/admin/props')
    return { success: true }
  } catch (error) {
    console.error('Error deleting volume:', error)
    return { success: false, error: 'Failed to delete volume' }
  }
}
