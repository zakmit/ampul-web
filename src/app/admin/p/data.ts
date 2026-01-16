import { prisma } from '@/lib/prisma'
import type { Locale } from '@/components/common/LanguageSelector'
import type { Prisma } from '@/generated/prisma/client'
import type { Product, Category, Collection, Volume, Tag } from './components'

// Type definitions matching the Prisma schema
export type ProductWithRelations = {
  id: string
  slug: string
  categoryId: number
  collectionId: number
  coverImage1x1: string
  coverImage16x9: string
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

// Transformation functions to convert Prisma data to component format
type CategoryWithTranslations = Prisma.CategoryGetPayload<{
  include: { translations: true };
}>;

type CollectionWithTranslations = Prisma.CollectionGetPayload<{
  include: { translations: true };
}>;

type VolumeWithTranslations = Prisma.VolumeGetPayload<{
  include: { translations: true };
}>;

type TagWithTranslations = Prisma.TagGetPayload<{
  include: { translations: true };
}>;

type ProductWithFullRelations = Prisma.ProductGetPayload<{
  include: {
    translations: true;
    volumes: true;
    tags: true;
  };
}>;

export function transformCategories(prismaCategories: CategoryWithTranslations[]): Category[] {
  return prismaCategories.map(cat => ({
    id: cat.id,
    slug: cat.slug,
    translations: cat.translations.reduce((acc: Record<Locale, { name: string }>, t) => {
      acc[t.locale as Locale] = { name: t.name };
      return acc;
    }, {} as Record<Locale, { name: string }>),
  }));
}

export function transformCollections(prismaCollections: CollectionWithTranslations[]): Collection[] {
  return prismaCollections.map(col => ({
    id: col.id,
    slug: col.slug,
    translations: col.translations.reduce((acc: Record<Locale, { name: string }>, t) => {
      acc[t.locale as Locale] = { name: t.name };
      return acc;
    }, {} as Record<Locale, { name: string }>),
  }));
}

export function transformVolumes(prismaVolumes: VolumeWithTranslations[]): Volume[] {
  return prismaVolumes.map(vol => ({
    id: vol.id,
    value: vol.value,
    translations: vol.translations.reduce((acc: Record<Locale, { displayName: string }>, t) => {
      acc[t.locale as Locale] = { displayName: t.displayName };
      return acc;
    }, {} as Record<Locale, { displayName: string }>),
  }));
}

export function transformTags(prismaTags: TagWithTranslations[]): Tag[] {
  return prismaTags.map(tag => ({
    id: tag.id,
    slug: tag.slug,
    translations: tag.translations.reduce((acc: Record<Locale, { name: string }>, t) => {
      acc[t.locale as Locale] = { name: t.name };
      return acc;
    }, {} as Record<Locale, { name: string }>),
  }));
}

export function transformProducts(prismaProducts: ProductWithFullRelations[]): Product[] {
  return prismaProducts.map(product => {
    // Group translations by locale
    const translations = product.translations.reduce((acc: Record<Locale, { name: string; concept: string; sensations: string }>, t) => {
      acc[t.locale as Locale] = {
        name: t.name,
        concept: t.concept,
        sensations: t.sensations,
      };
      return acc;
    }, {} as Record<Locale, { name: string; concept: string; sensations: string }>);

    // Group volumes by volumeId
    const volumesMap = new Map<number, { volumeId: number; prices: Record<Locale, { price: number; stock: number | null }> }>();

    product.volumes.forEach((pv) => {
      if (!volumesMap.has(pv.volumeId)) {
        volumesMap.set(pv.volumeId, {
          volumeId: pv.volumeId,
          prices: {} as Record<Locale, { price: number; stock: number | null }>,
        });
      }
      const volumeEntry = volumesMap.get(pv.volumeId)!;
      volumeEntry.prices[pv.locale as Locale] = {
        price: Number(pv.price),
        stock: pv.stock,
      };
    });

    return {
      id: product.id,
      slug: product.slug,
      categoryId: product.categoryId,
      collectionId: product.collectionId,
      coverImage1x1: product.coverImage1x1,
      coverImage16x9: product.coverImage16x9,
      productImage: product.productImage,
      boxImage: product.boxImage,
      galleryImages: product.galleryImages,
      translations,
      volumes: Array.from(volumesMap.values()),
      tagIds: product.tags.map((pt) => pt.tagId),
    };
  });
}

// Fetch and transform all data needed for the admin page
export async function getAllAdminData() {
  const [categories, collections, volumes, tags, products] = await Promise.all([
    getCategoriesData(),
    getCollectionsData(),
    getVolumesData(),
    getTagsData(),
    prisma.product.findMany({
      include: {
        translations: true,
        volumes: true,
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  return {
    categories: transformCategories(categories),
    collections: transformCollections(collections),
    volumes: transformVolumes(volumes),
    tags: transformTags(tags),
    products: transformProducts(products),
  };
}
