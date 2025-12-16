import ProductsClient from './ProductsClient';
import type { Product, Category, Collection, Volume, Tag } from './components';

// Dummy data for development
const dummyCategories: Category[] = [
  {
    id: 1,
    slug: 'eau-de-toilette',
    translations: {
      'en-US': { name: 'Eau de Toilette' },
      'fr-FR': { name: 'Eau de Toilette' },
      'zh-TW': { name: 'Eau de Toilette' },
    },
  },
  {
    id: 2,
    slug: 'eau-de-parfum',
    translations: {
      'en-US': { name: 'Eau de Parfum' },
      'fr-FR': { name: 'Eau de Parfum' },
      'zh-TW': { name: 'Eau de Parfum' },
    },
  },
];

const dummyCollections: Collection[] = [
  {
    id: 1,
    slug: 'greek-mythology',
    translations: {
      'en-US': { name: 'Greek Mythology' },
      'fr-FR': { name: 'Mythologie Grecque' },
      'zh-TW': { name: 'Greek Mythology' },
    },
  },
];

const dummyVolumes: Volume[] = [
  {
    id: 1,
    value: '100ml',
    translations: {
      'en-US': { displayName: '100 ml' },
      'fr-FR': { displayName: '100 ml' },
      'zh-TW': { displayName: '100 ml' },
    },
  },
  {
    id: 2,
    value: '200ml',
    translations: {
      'en-US': { displayName: '200 ml' },
      'fr-FR': { displayName: '200 ml' },
      'zh-TW': { displayName: '200 ml' },
    },
  },
];

const dummyTags: Tag[] = [
  {
    id: 1,
    slug: 'woody',
    translations: {
      'en-US': { name: 'Woody' },
      'fr-FR': { name: 'Woody' },
      'zh-TW': { name: 'Woody' },
    },
  },
  {
    id: 2,
    slug: 'floral',
    translations: {
      'en-US': { name: 'Floral' },
      'fr-FR': { name: 'Floral' },
      'zh-TW': { name: 'Floral' },
    },
  },
  {
    id: 3,
    slug: 'citrus',
    translations: {
      'en-US': { name: 'Citrus' },
      'fr-FR': { name: 'Citrus' },
      'zh-TW': { name: 'Citrus' },
    },
  },
];

const dummyProducts: Product[] = [
  {
    id: '1',
    slug: 'icare',
    categoryId: 1,
    collectionId: 1,
    coverImageDesktop: '/products/icare-promo.jpg',
    coverImageMobile: '/products/icare-cover.jpg',
    productImage: '/products/icare-bottle.jpg',
    boxImage: '/products/icare-box.jpg',
    galleryImages: [],
    translations: {
      'en-US': {
        name: 'Icarus',
        concept: 'His desire for a brilliant, burning dream melts his wings of survival.',
        sensations: 'Bold, Ambitious, Fiery',
      },
      'fr-FR': {
        name: 'Icare',
        concept: 'His desire for a brilliant, burning dream melts his wings of survival.',
        sensations: 'Bold, Ambitious, Fiery',
      },
      'zh-TW': {
        name: 'Icarus',
        concept: 'His desire for a brilliant, burning dream melts his wings of survival.',
        sensations: 'Bold, Ambitious, Fiery',
      },
    },
    volumes: [
      {
        volumeId: 1,
        prices: {
          'en-US': { price: 200, stock: 50 },
          'fr-FR': { price: 180, stock: 50 },
          'zh-TW': { price: 6000, stock: 50 },
        },
      },
      {
        volumeId: 2,
        prices: {
          'en-US': { price: 350, stock: 30 },
          'fr-FR': { price: 320, stock: 30 },
          'zh-TW': { price: 10500, stock: 30 },
        },
      },
    ],
    tagIds: [1, 3],
  },
  {
    id: '2',
    slug: 'cassandre',
    categoryId: 1,
    collectionId: 1,
    coverImageDesktop: '/products/cassandre-promo.jpg',
    coverImageMobile: '/products/cassandre-cover.jpg',
    productImage: '/products/cassandre-bottle.jpg',
    boxImage: '/products/cassandre-box.jpg',
    galleryImages: [],
    translations: {
      'en-US': {
        name: 'Cassandra',
        concept: 'For those awake among the numb, compelled to cry out.',
        sensations: 'Prophetic, Mysterious, Intense',
      },
      'fr-FR': {
        name: 'Cassandre',
        concept: 'For those awake among the numb, compelled to cry out.',
        sensations: 'Prophetic, Mysterious, Intense',
      },
      'zh-TW': {
        name: 'Cassandra',
        concept: 'For those awake among the numb, compelled to cry out.',
        sensations: 'Prophetic, Mysterious, Intense',
      },
    },
    volumes: [
      {
        volumeId: 1,
        prices: {
          'en-US': { price: 200, stock: 40 },
          'fr-FR': { price: 180, stock: 40 },
          'zh-TW': { price: 6000, stock: 40 },
        },
      },
    ],
    tagIds: [2],
  },
  {
    id: '3',
    slug: 'narcisse',
    categoryId: 1,
    collectionId: 1,
    coverImageDesktop: '/products/narcisse-promo.jpg',
    coverImageMobile: '/products/narcisse-cover.jpg',
    productImage: '/products/narcisse-bottle.jpg',
    boxImage: '/products/narcisse-box.jpg',
    galleryImages: [],
    translations: {
      'en-US': {
        name: 'Narcissus',
        concept: 'His love, to a beautiful illusion which never exist, makes him lost his mind',
        sensations: 'Enchanting, Self-absorbed, Beautiful',
      },
      'fr-FR': {
        name: 'Narcisse',
        concept: 'His love, to a beautiful illusion which never exist, makes him lost his mind',
        sensations: 'Enchanting, Self-absorbed, Beautiful',
      },
      'zh-TW': {
        name: 'Narcissus',
        concept: 'His love, to a beautiful illusion which never exist, makes him lost his mind',
        sensations: 'Enchanting, Self-absorbed, Beautiful',
      },
    },
    volumes: [
      {
        volumeId: 1,
        prices: {
          'en-US': { price: 200, stock: 45 },
          'fr-FR': { price: 180, stock: 45 },
          'zh-TW': { price: 6000, stock: 45 },
        },
      },
      {
        volumeId: 2,
        prices: {
          'en-US': { price: 350, stock: 25 },
          'fr-FR': { price: 320, stock: 25 },
          'zh-TW': { price: 10500, stock: 25 },
        },
      },
    ],
    tagIds: [2],
  },
  {
    id: '4',
    slug: 'antigone',
    categoryId: 1,
    collectionId: 1,
    coverImageDesktop: '/products/antigone-promo.jpg',
    coverImageMobile: '/products/antigone-cover.jpg',
    productImage: '/products/antigone-bottle.jpg',
    boxImage: '/products/antigone-box.jpg',
    galleryImages: [],
    translations: {
      'en-US': {
        name: 'Antigone',
        concept: 'Her loyalty to family brings her to the edge of life and death.',
        sensations: 'Loyal, Defiant, Tragic',
      },
      'fr-FR': {
        name: 'Antigone',
        concept: 'Her loyalty to family brings her to the edge of life and death.',
        sensations: 'Loyal, Defiant, Tragic',
      },
      'zh-TW': {
        name: 'Antigone',
        concept: 'Her loyalty to family brings her to the edge of life and death.',
        sensations: 'Loyal, Defiant, Tragic',
      },
    },
    volumes: [
      {
        volumeId: 1,
        prices: {
          'en-US': { price: 200, stock: 35 },
          'fr-FR': { price: 180, stock: 35 },
          'zh-TW': { price: 6000, stock: 35 },
        },
      },
    ],
    tagIds: [1, 2],
  },
];

export default async function ProductsPage() {
  // In production, fetch from database:
  // const products = await getProductsData();
  // const categories = await getCategoriesData();
  // const collections = await getCollectionsData();
  // const volumes = await getVolumesData();
  // const tags = await getTagsData();

  return (
    <ProductsClient
      initialProducts={dummyProducts}
      categories={dummyCategories}
      collections={dummyCollections}
      volumes={dummyVolumes}
      tags={dummyTags}
    />
  );
}
