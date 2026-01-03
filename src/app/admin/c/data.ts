import { prisma } from '@/lib/prisma'

// Type definitions matching the Prisma schema
export type CollectionWithTranslations = {
  id: number
  slug: string
  coverImage1x1: string
  coverImage16x9: string
  translations: {
    collectionId: number
    locale: string
    name: string
    description: string
  }[]
}

// Fetch all collections for the admin page
export async function getCollectionsData() {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        id: 'asc',
      },
    })

    return collections
  } catch (error) {
    console.error('Error fetching collections data:', error)
    throw error
  }
}
