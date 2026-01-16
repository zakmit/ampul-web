'use client';

import { useState, useTransition } from 'react';
import type {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImages,
} from './actions';
import {
  ProductEditForm,
  CANCEL_BUTTON,
  DELETE_BUTTON,
  type Product,
  type Category,
  type Collection,
  type Volume,
  type Tag,
} from './components';
import { ChevronRight, Plus } from 'lucide-react';
import Image from 'next/image';
import ProductFilters, { FilterSection } from '@/components/product/ProductFilters';
import MobileFilterPanel from '@/components/product/MobileFilterPanel';

interface ServerActions {
  createProduct: typeof createProduct;
  updateProduct: typeof updateProduct;
  deleteProduct: typeof deleteProduct;
  uploadProductImage: typeof uploadProductImage;
  deleteProductImages: typeof deleteProductImages;
}

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
  collections: Collection[];
  volumes: Volume[];
  tags: Tag[];
  serverActions?: ServerActions | null;
}

export default function ProductsClient({
  initialProducts,
  categories,
  collections,
  volumes,
  tags,
  serverActions = null,
}: ProductsClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isPending, startTransition] = useTransition();

  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [collectionFilter, setCollectionFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);

  // Track current form images to delete replaced ones
  const [currentFormImages, setCurrentFormImages] = useState<{
    desktop: string;
    mobile: string;
    product: string;
    box: string;
    gallery: string[];
  }>({
    desktop: '',
    mobile: '',
    product: '',
    box: '',
    gallery: [],
  });

  // Track original images when editing (for update comparison)
  const [originalImages, setOriginalImages] = useState<{
    desktop: string;
    mobile: string;
    product: string;
    box: string;
    gallery: string[];
  } | null>(null);

  // Filter sections
  const filterSections: FilterSection[] = [
    {
      id: 'sort',
      title: 'Sort By',
      type: 'radio',
      options: [
        { id: 'default', label: 'Create Order' },
        { id: 'name-asc', label: 'Name A-Z' },
        { id: 'name-desc', label: 'Name Z-A' },
      ],
      value: sortBy,
      onChange: (value) => setSortBy(value as string),
    },
    {
      id: 'collection',
      title: 'Collection',
      type: 'checkbox',
      options: collections.map(col => ({
        id: col.id.toString(),
        label: col.translations['en-US']?.name || col.slug,
      })),
      value: collectionFilter,
      onChange: (value) => setCollectionFilter(value as string[]),
    },
    {
      id: 'tags',
      title: 'Tags',
      type: 'checkbox',
      options: tags.map(tag => ({
        id: tag.id.toString(),
        label: tag.translations['en-US']?.name || tag.slug,
      })),
      value: tagFilter,
      onChange: (value) => setTagFilter(value as string[]),
    },
  ];

  const clearAllEditing = async () => {
    // Clean up current form images if user is canceling
    if (serverActions) {
      const imagesToDelete = [];
      if (currentFormImages.desktop && currentFormImages.desktop.startsWith('/uploads/products/')) {
        if (!originalImages || currentFormImages.desktop !== originalImages.desktop) {
          imagesToDelete.push(currentFormImages.desktop);
        }
      }
      if (currentFormImages.mobile && currentFormImages.mobile.startsWith('/uploads/products/')) {
        if (!originalImages || currentFormImages.mobile !== originalImages.mobile) {
          imagesToDelete.push(currentFormImages.mobile);
        }
      }
      if (currentFormImages.product && currentFormImages.product.startsWith('/uploads/products/')) {
        if (!originalImages || currentFormImages.product !== originalImages.product) {
          imagesToDelete.push(currentFormImages.product);
        }
      }
      if (currentFormImages.box && currentFormImages.box.startsWith('/uploads/products/')) {
        if (!originalImages || currentFormImages.box !== originalImages.box) {
          imagesToDelete.push(currentFormImages.box);
        }
      }
      if (currentFormImages.gallery.length > 0) {
        const newGalleryImages = currentFormImages.gallery.filter(img =>
          (!originalImages || !originalImages.gallery.includes(img)) && img.startsWith('/uploads/products/')
        );
        imagesToDelete.push(...newGalleryImages);
      }

      if (imagesToDelete.length > 0) {
        await serverActions.deleteProductImages(imagesToDelete);
      }
    }

    setEditingProduct(null);
    setIsCreating(false);
    setOriginalImages(null);
    setCurrentFormImages({ desktop: '', mobile: '', product: '', box: '', gallery: [] });
  };

  const handleEditProduct = (id: string | null) => {
    clearAllEditing();
    if (id !== null) {
      const product = products.find(p => p.id === id);
      if (product) {
        setOriginalImages({
          desktop: product.coverImage1x1,
          mobile: product.coverImage16x9,
          product: product.productImage,
          box: product.boxImage,
          gallery: product.galleryImages,
        });
        setCurrentFormImages({
          desktop: product.coverImage1x1,
          mobile: product.coverImage16x9,
          product: product.productImage,
          box: product.boxImage,
          gallery: product.galleryImages,
        });
      }
    }
    setEditingProduct(id);
  };

  const handleCreateProduct = () => {
    clearAllEditing();
    setIsCreating(true);
    setCurrentFormImages({ desktop: '', mobile: '', product: '', box: '', gallery: [] });
  };

  // Product handlers
  const handleSubmitNewProduct = async (newProduct: Omit<Product, 'id'>) => {
    if (!serverActions) return; // Ignore if not admin

    startTransition(async () => {
      const translations = Object.entries(newProduct.translations).map(([locale, data]) => ({
        locale,
        name: data.name,
        concept: data.concept,
        sensations: data.sensations,
      }));

      const volumes = newProduct.volumes.flatMap(vol =>
        Object.entries(vol.prices).map(([locale, priceData]) => ({
          volumeId: vol.volumeId,
          locale,
          price: priceData.price,
          stock: priceData.stock,
        }))
      );

      const result = await serverActions.createProduct({
        slug: newProduct.slug,
        categoryId: newProduct.categoryId,
        collectionId: newProduct.collectionId,
        coverImage1x1: newProduct.coverImage1x1,
        coverImage16x9: newProduct.coverImage16x9,
        productImage: newProduct.productImage,
        boxImage: newProduct.boxImage,
        galleryImages: newProduct.galleryImages,
        translations,
        volumes,
        tagIds: newProduct.tagIds,
      });

      if (result.success && result.data) {
        // Close the creation form and refresh to show updated data
        setIsCreating(false);
        // Force a hard refresh by navigating to the same route
        // This ensures we fetch the latest validated data from the database
        window.location.href = '/admin/p';
      } else {
        alert(result.error || 'Failed to create product');
      }
    });
  };

  const handleUpdateProduct = async (id: string, updatedProduct: Omit<Product, 'id'>) => {
    if (!serverActions) return; // Ignore if not admin

    startTransition(async () => {
      const translations = Object.entries(updatedProduct.translations).map(([locale, data]) => ({
        locale,
        name: data.name,
        concept: data.concept,
        sensations: data.sensations,
      }));

      const volumes = updatedProduct.volumes.flatMap(vol =>
        Object.entries(vol.prices).map(([locale, priceData]) => ({
          volumeId: vol.volumeId,
          locale,
          price: priceData.price,
          stock: priceData.stock,
        }))
      );

      const result = await serverActions.updateProduct(id, {
        slug: updatedProduct.slug,
        categoryId: updatedProduct.categoryId,
        collectionId: updatedProduct.collectionId,
        coverImage1x1: updatedProduct.coverImage1x1,
        coverImage16x9: updatedProduct.coverImage16x9,
        productImage: updatedProduct.productImage,
        boxImage: updatedProduct.boxImage,
        galleryImages: updatedProduct.galleryImages,
        translations,
        volumes,
        tagIds: updatedProduct.tagIds,
      }, originalImages || undefined);

      if (result.success && result.data) {
        // Close the editing form and refresh to show updated data
        setEditingProduct(null);
        // Force a hard refresh by navigating to the same route
        // This ensures we fetch the latest validated data from the database
        window.location.href = '/admin/p';
      } else {
        alert(result.error || 'Failed to update product');
      }
    });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!serverActions) return; // Ignore if not admin

    startTransition(async () => {
      const result = await serverActions.deleteProduct(id);

      if (result.success) {
        setProducts(products.filter((p) => p.id !== id));
        setEditingProduct(null);
        setDeleteConfirmation(null);
      } else {
        alert(result.error || 'Failed to delete product');
      }
    });
  };

  const confirmDelete = () => {
    if (deleteConfirmation !== null) {
      handleDeleteProduct(deleteConfirmation);
    }
  };

  const handleImageUpload = async (file: File, imageType: 'desktop' | 'mobile' | 'product' | 'box' | 'gallery') => {
    if (!serverActions) return null; // Ignore if not admin

    const currentImageUrl = imageType === 'gallery' ? '' : currentFormImages[imageType];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageType', imageType);

    const result = await serverActions.uploadProductImage(formData);

    if (result.success && result.data) {
      const uploadedUrl = result.data.url;

      // Delete the old image if it exists and is not the original
      if (currentImageUrl && currentImageUrl.startsWith('/uploads/')) {
        const isOriginal = originalImages && originalImages[imageType as keyof typeof originalImages] === currentImageUrl;
        if (!isOriginal) {
          await serverActions.deleteProductImages([currentImageUrl]);
        }
      }

      // Update current form images
      if (imageType === 'gallery') {
        setCurrentFormImages((prev) => ({
          ...prev,
          gallery: [...prev.gallery, uploadedUrl],
        }));
      } else {
        setCurrentFormImages((prev) => ({
          ...prev,
          [imageType]: uploadedUrl,
        }));
      }

      return uploadedUrl;
    } else {
      alert(result.error || 'Failed to upload image');
      return null;
    }
  };

  // Filter and sort products
  let filteredProducts = [...products];

  // Filter by collection
  if (collectionFilter.length > 0) {
    filteredProducts = filteredProducts.filter(p =>
      collectionFilter.includes(p.collectionId.toString())
    );
  }

  // Filter by tags
  if (tagFilter.length > 0) {
    filteredProducts = filteredProducts.filter(p =>
      p.tagIds.some(tagId => tagFilter.includes(tagId.toString()))
    );
  }

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.translations['en-US'].name.localeCompare(b.translations['en-US'].name);
      case 'name-desc':
        return b.translations['en-US'].name.localeCompare(a.translations['en-US'].name);
      default:
        return 0; // Keep default order
    }
  });

  return (
    <div className="lg:min-h-screen w-full bg-white">
      {/* Delete Confirmation Popup */}
      {deleteConfirmation !== null && (
        <div
          className="fixed inset-0 bg-gray-800/20 z-80 backdrop-blur-sm transition-all duration-500 flex items-center justify-center"
          onClick={() => setDeleteConfirmation(null)}
        >
          <div
            className="bg-white p-8 shadow-xl max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className={CANCEL_BUTTON}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className={DELETE_BUTTON}
                disabled={isPending}
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Popup - Full Screen */}
      {(editingProduct !== null || isCreating) && (
        <div className="fixed inset-0 bg-gray-800/20 z-70 backdrop-blur-sm transition-all duration-500 flex items-center justify-center">
          <div
            className="bg-white w-full max-w-2xl lg:max-w-none h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 lg:p-0">
              {isCreating ? (
                <ProductEditForm
                  product={null}
                  categories={categories}
                  collections={collections}
                  volumes={volumes}
                  tags={tags}
                  onCancel={clearAllEditing}
                  onSubmit={handleSubmitNewProduct}
                  onImageUpload={handleImageUpload}
                  isPending={isPending}
                />
              ) : editingProduct !== null ? (
                <ProductEditForm
                  product={products.find(p => p.id === editingProduct)!}
                  categories={categories}
                  collections={collections}
                  volumes={volumes}
                  tags={tags}
                  onCancel={clearAllEditing}
                  onSubmit={(updatedProduct) => handleUpdateProduct(editingProduct, updatedProduct)}
                  onDelete={() => setDeleteConfirmation(editingProduct)}
                  onImageUpload={handleImageUpload}
                  isPending={isPending}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-1 lg:min-h-screen">
        {/* Products Content Area - No right panel */}
        <div className="lg:overflow-y-auto lg:h-full transition-all">
          {/* Header */}
          <div className="lg:mx-6 lg:mt-2 lg:mb-0">
            <div className="w-full flex items-center justify-center lg:justify-between p-6 lg:px-2 bg-white">
              <div className="flex flex-col items-start gap-1">
                <h2 className="text-3xl font-bold lg:text-4xl">Products</h2>
                <span className="hidden lg:block text-sm">
                  {products.length > 1 ? `${products.length} products` : `${products.length} product`}
                </span>
              </div>
              {/* Desktop Plus Button */}
              <button onClick={handleCreateProduct} className="hidden lg:block hover:text-gray-600">
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Content Section */}
            <div className="border-t border-gray-500">
              {/* Mobile Filter and Plus */}
              <div className="flex border-b border-gray-500 lg:hidden px-6 py-4 mb-4 items-center justify-between text-sm">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="flex items-center gap-2 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4" style={{fillRule: 'evenodd', clipRule: 'evenodd', strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 1.5 }}>
                    <path d="M5,8l14,0" fill="none" strokeWidth="1.04px"/>
                    <path d="M5,16l14,-0" fill="none" strokeWidth="1.04px"/>
                    <path d="M9.5,7.648l0,0.704c0,0.194 -0.158,0.351 -0.352,0.351l-1.296,0c-0.194,0 -0.352,-0.157 -0.352,-0.351l0,-0.704c0,-0.194 0.158,-0.351 0.352,-0.351l1.296,-0c0.194,-0 0.352,0.157 0.352,0.351Z" fill="none" strokeWidth="1.04px" style={{strokeMiterlimit:2}} />
                    <path d="M16.5,15.648l0,0.704c0,0.194 -0.158,0.351 -0.352,0.351l-1.296,0c-0.194,0 -0.352,-0.157 -0.352,-0.351l0,-0.704c0,-0.194 0.158,-0.351 0.352,-0.351l1.296,-0c0.194,-0 0.352,0.157 0.352,0.351Z" fill="none" strokeWidth="1.04px" style={{strokeMiterlimit:2}} />
                  </svg>
                  <span className="text-sm">
                    {products.length > 1 ? `${products.length} products` : `${products.length} product`}
                  </span>
                </button>
                <button onClick={handleCreateProduct} className="hover:text-gray-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Filter Panel */}
              <MobileFilterPanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filterSections={filterSections}
              />

              {/* Desktop: Filter Left, Products Right */}
              <div className="hidden lg:flex mx-4 mb-4 lg:mb-10 mt-4">
                {/* Left: Filter */}
                <div className="w-48 shrink-0">
                  <div className="flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{fillRule: 'evenodd', clipRule: 'evenodd', strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 1.5 }}>
                      <path d="M5,8l14,0" fill="none" strokeWidth="1.04px"/>
                      <path d="M5,16l14,-0" fill="none" strokeWidth="1.04px"/>
                      <path d="M9.5,7.648l0,0.704c0,0.194 -0.158,0.351 -0.352,0.351l-1.296,0c-0.194,0 -0.352,-0.157 -0.352,-0.351l0,-0.704c0,-0.194 0.158,-0.351 0.352,-0.351l1.296,-0c0.194,-0 0.352,0.157 0.352,0.351Z" fill="none" strokeWidth="1.04px" style={{strokeMiterlimit:2}} />
                      <path d="M16.5,15.648l0,0.704c0,0.194 -0.158,0.351 -0.352,0.351l-1.296,0c-0.194,0 -0.352,-0.157 -0.352,-0.351l0,-0.704c0,-0.194 0.158,-0.351 0.352,-0.351l1.296,-0c0.194,-0 0.352,0.157 0.352,0.351Z" fill="none" strokeWidth="1.04px" style={{strokeMiterlimit:2}} />
                    </svg>
                    <h3 className="text-lg font-bold">Filter</h3>
                  </div>
                  <ProductFilters sections={filterSections} />
                </div>

                {/* Right: Products Grid */}
                <div className="flex-1 flex flex-col gap-6">
                  {sortedProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        if (editingProduct === product.id) {
                          handleEditProduct(null);
                        } else {
                          handleEditProduct(product.id);
                        }
                      }}
                      className="w-full h-32 relative overflow-hidden group flex duration-500 transition-all items-center justify-between px-6"
                    >
                      <Image
                        src={product.coverImage16x9}
                        alt={product.translations['en-US'].name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-gray-900/60 via-gray-900/20 to-transparent" />
                      <span className="relative z-1 text-3xl font-title text-white">
                        {product.translations['en-US'].name}
                      </span>
                      <ChevronRight className="relative z-1 w-8 h-8 text-white" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Products Grid */}
              <div className="lg:hidden flex flex-col gap-4 mx-4 mb-4">
                {sortedProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      if (editingProduct === product.id) {
                        handleEditProduct(null);
                      } else {
                        handleEditProduct(product.id);
                      }
                    }}
                    className="w-full h-20 relative overflow-hidden group flex items-center justify-between px-6"
                  >
                    <Image
                      src={product.coverImage16x9}
                      alt={product.translations['en-US'].name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-gray-900/60 via-gray-900/20 to-transparent" />
                    <span className="relative z-1 text-2xl font-title text-white">
                      {product.translations['en-US'].name}
                    </span>
                    <ChevronRight className="relative z-1 w-6 h-6 text-white" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
