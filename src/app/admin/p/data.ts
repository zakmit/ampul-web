import { prisma } from '@/lib/prisma'

// Type definitions matching the Prisma schema
export type ProductWithRelations = {
  id: string
  slug: string
  categoryId: number
  collectionId: number
  coverImageDesktop: string
  coverImageMobile: string
  productImage: string
  boxImage: string
  galleryImages: string[]
  createdAt: Date
  updatedAt: Date
  category: {
    id: number
    slug: string
    translations: {
      categoryId: number
      locale: string
      name: string
      description: string
    }[]
  }
  collection: {
    id: number
    slug: string
    translations: {
      collectionId: number
      locale: string
      name: string
      description: string
    }[]
  }
  translations: {
    productId: string
    locale: string
    name: string
    concept: string
    sensations: string
  }[]
  volumes: {
    productId: string
    volumeId: number
    locale: string
    price: number
    stock: number | null
    volume: {
      id: number
      value: string
      translations: {
        volumeId: number
        locale: string
        displayName: string
      }[]
    }
  }[]
  tags: {
    productId: string
    tagId: number
    tag: {
      id: number
      slug: string
      translations: {
        tagId: number
        locale: string
        name: string
      }[]
    }
  }[]
}

// Fetch all products for the admin page
export async function getProductsData() {
  try {
    const products = await prisma.product.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return products
  } catch (error) {
    console.error('Error fetching products data:', error)
    throw error
  }
}

// Get all categories
export async function getCategoriesData() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        id: 'asc',
      },
    })

    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

// Get all collections
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
    console.error('Error fetching collections:', error)
    throw error
  }
}

// Get all volumes
export async function getVolumesData() {
  try {
    const volumes = await prisma.volume.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        id: 'asc',
      },
    })

    return volumes
  } catch (error) {
    console.error('Error fetching volumes:', error)
    throw error
  }
}

// Get all tags
export async function getTagsData() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        id: 'asc',
      },
    })

    return tags
  } catch (error) {
    console.error('Error fetching tags:', error)
    throw error
  }
}
