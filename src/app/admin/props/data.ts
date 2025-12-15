import { prisma } from '@/lib/prisma'

// Type definitions matching the Prisma schema
export type CategoryWithTranslations = {
  id: number
  slug: string
  translations: {
    categoryId: number
    locale: string
    name: string
    description: string
  }[]
}

export type TagWithTranslations = {
  id: number
  slug: string
  translations: {
    tagId: number
    locale: string
    name: string
  }[]
}

export type VolumeWithTranslations = {
  id: number
  value: string
  translations: {
    volumeId: number
    locale: string
    displayName: string
  }[]
}

// Fetch all data for the properties page
export async function getPropertiesData() {
  try {
    const [categories, tags, volumes] = await Promise.all([
      prisma.category.findMany({
        include: {
          translations: true,
        },
        orderBy: {
          id: 'asc',
        },
      }),
      prisma.tag.findMany({
        include: {
          translations: true,
        },
        orderBy: {
          id: 'asc',
        },
      }),
      prisma.volume.findMany({
        include: {
          translations: true,
        },
        orderBy: {
          id: 'asc',
        },
      }),
    ])

    return {
      categories,
      tags,
      volumes,
    }
  } catch (error) {
    console.error('Error fetching properties data:', error)
    throw error
  }
}
