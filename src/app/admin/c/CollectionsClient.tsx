'use client';

import { useState, useTransition } from 'react';
import type { Locale } from '@/components/common/LanguageSelector';
import type { CollectionWithTranslations } from './data';
import type {
  createCollection,
  updateCollection,
  deleteCollection,
  uploadCollectionImage,
  deleteCollectionImages,
} from './actions';
import {
  CollectionEditForm,
  CANCEL_BUTTON,
  DELETE_BUTTON,
  type Collection,
} from './components';
import { ChevronRight, Plus } from 'lucide-react';
import Image from 'next/image';
import ProductFilters, { FilterSection } from '@/components/product/ProductFilters';
import MobileFilterPanel from '@/components/product/MobileFilterPanel';

// Transform Prisma data to UI format
function transformCollections(collections: CollectionWithTranslations[]): Collection[] {
  return collections.map((col) => ({
    id: col.id,
    slug: col.slug,
    coverImage1x1: col.coverImage1x1,
    coverImage16x9: col.coverImage16x9,
    translations: col.translations.reduce((acc, t) => {
      acc[t.locale as Locale] = { name: t.name, description: t.description };
      return acc;
    }, {} as Record<Locale, { name: string; description: string }>),
  }));
}

interface ServerActions {
  createCollection: typeof createCollection;
  updateCollection: typeof updateCollection;
  deleteCollection: typeof deleteCollection;
  uploadCollectionImage: typeof uploadCollectionImage;
  deleteCollectionImages: typeof deleteCollectionImages;
}

export default function CollectionsClient({
  initialCollections,
  serverActions = null,
}: {
  initialCollections: CollectionWithTranslations[]
  serverActions?: ServerActions | null
}) {
  const [collections, setCollections] = useState(transformCollections(initialCollections));
  const [isPending, startTransition] = useTransition();

  const [editingCollection, setEditingCollection] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // Track current form images to delete replaced ones
  const [currentFormImages, setCurrentFormImages] = useState<{ desktop: string; mobile: string }>({
    desktop: '',
    mobile: '',
  });

  // Track original images when editing (for update comparison)
  const [originalImages, setOriginalImages] = useState<{ desktop: string; mobile: string } | null>(null);

  // Filter sections - only "Sort By" for this page
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
  ];

  const clearAllEditing = async () => {
    // Clean up current form images if user is canceling
    if (serverActions) {
      const imagesToDelete = [];
      if (currentFormImages.desktop && currentFormImages.desktop.startsWith('/uploads/')) {
        // Only delete if it's a newly uploaded image (not the original)
        if (!originalImages || currentFormImages.desktop !== originalImages.desktop) {
          imagesToDelete.push(currentFormImages.desktop);
        }
      }
      if (currentFormImages.mobile && currentFormImages.mobile.startsWith('/uploads/')) {
        // Only delete if it's a newly uploaded image (not the original)
        if (!originalImages || currentFormImages.mobile !== originalImages.mobile) {
          imagesToDelete.push(currentFormImages.mobile);
        }
      }

      if (imagesToDelete.length > 0) {
        await serverActions.deleteCollectionImages(imagesToDelete);
      }
    }

    setEditingCollection(null);
    setIsCreating(false);
    setOriginalImages(null);
    setCurrentFormImages({ desktop: '', mobile: '' });
  };

  const handleEditCollection = (id: number | null) => {
    clearAllEditing();
    if (id !== null) {
      const collection = collections.find(c => c.id === id);
      if (collection) {
        setOriginalImages({
          desktop: collection.coverImage1x1,
          mobile: collection.coverImage16x9,
        });
        setCurrentFormImages({
          desktop: collection.coverImage1x1,
          mobile: collection.coverImage16x9,
        });
      }
    }
    setEditingCollection(id);
  };

  const handleCreateCollection = () => {
    clearAllEditing();
    setIsCreating(true);
    setCurrentFormImages({ desktop: '', mobile: '' });
  };

  // Collection handlers
  const handleSubmitNewCollection = async (newCollection: Omit<Collection, 'id'>) => {
    if (!serverActions) return; // Ignore if not admin

    startTransition(async () => {
      const translations = Object.entries(newCollection.translations).map(([locale, data]) => ({
        locale,
        name: data.name,
        description: data.description,
      }));

      const result = await serverActions.createCollection({
        slug: newCollection.slug,
        coverImage1x1: newCollection.coverImage1x1,
        coverImage16x9: newCollection.coverImage16x9,
        translations,
      });

      if (result.success && result.data) {
        const transformed = transformCollections([result.data]);
        setCollections([...collections, ...transformed]);
        setIsCreating(false);
        // Clear form images since they're now part of the collection
        setCurrentFormImages({ desktop: '', mobile: '' });
      } else {
        alert(result.error || 'Failed to create collection');
      }
    });
  };

  const handleUpdateCollection = async (id: number, updatedCollection: Omit<Collection, 'id'>) => {
    if (!serverActions) return; // Ignore if not admin

    startTransition(async () => {
      const translations = Object.entries(updatedCollection.translations).map(([locale, data]) => ({
        locale,
        name: data.name,
        description: data.description,
      }));

      const result = await serverActions.updateCollection(id, {
        slug: updatedCollection.slug,
        coverImage1x1: updatedCollection.coverImage1x1,
        coverImage16x9: updatedCollection.coverImage16x9,
        translations,
      }, originalImages || undefined);

      if (result.success && result.data) {
        const transformed = transformCollections([result.data]);
        setCollections(collections.map((c) => (c.id === id ? transformed[0] : c)));
        setEditingCollection(null);
        // Clear form images and original images since update is complete
        setCurrentFormImages({ desktop: '', mobile: '' });
        setOriginalImages(null);
      } else {
        alert(result.error || 'Failed to update collection');
      }
    });
  };

  const handleDeleteCollection = async (id: number) => {
    if (!serverActions) return; // Ignore if not admin

    startTransition(async () => {
      const result = await serverActions.deleteCollection(id);

      if (result.success) {
        setCollections(collections.filter((c) => c.id !== id));
        setEditingCollection(null);
        setDeleteConfirmation(null);
      } else {
        alert(result.error || 'Failed to delete collection');
      }
    });
  };

  const confirmDelete = () => {
    if (deleteConfirmation !== null) {
      handleDeleteCollection(deleteConfirmation);
    }
  };

  const handleImageUpload = async (file: File, imageType: 'desktop' | 'mobile') => {
    if (!serverActions) return null; // Ignore if not admin

    // Get the current image URL for this type
    const currentImageUrl = currentFormImages[imageType];

    // Upload the new image first
    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageType', imageType);

    const result = await serverActions.uploadCollectionImage(formData);

    if (result.success && result.data) {
      // Delete the old image if it exists and is not the original
      if (currentImageUrl && currentImageUrl.startsWith('/uploads/')) {
        // Only delete if it's not the original image from the database
        const isOriginal = originalImages && originalImages[imageType] === currentImageUrl;
        if (!isOriginal) {
          await serverActions.deleteCollectionImages([currentImageUrl]);
        }
      }

      // Update current form images
      setCurrentFormImages((prev) => ({
        ...prev,
        [imageType]: result.data.url,
      }));

      return result.data.url;
    } else {
      alert(result.error || 'Failed to upload image');
      return null;
    }
  };

  const isEditing = editingCollection !== null || isCreating;

  // Sort collections
  const sortedCollections = [...collections].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.translations['en-US'].name.localeCompare(b.translations['en-US'].name);
      case 'name-desc':
        return b.translations['en-US'].name.localeCompare(a.translations['en-US'].name);
      default:
        return a.id - b.id;
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
              Are you sure you want to delete this collection? This action cannot be undone.
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

      {/* Mobile Edit Full Screen */}
      {(editingCollection !== null || isCreating) && (
        <div className="lg:hidden fixed inset-0 bg-white z-60 overflow-y-auto">
          <div className="p-6">
            {isCreating ? (
              <CollectionEditForm
                collection={null}
                onCancel={clearAllEditing}
                onSubmit={handleSubmitNewCollection}
                onImageUpload={handleImageUpload}
                isPending={isPending}
              />
            ) : editingCollection !== null ? (
              <CollectionEditForm
                collection={collections.find(c => c.id === editingCollection)!}
                onCancel={clearAllEditing}
                onSubmit={(updatedCollection) => handleUpdateCollection(editingCollection, updatedCollection)}
                onDelete={() => setDeleteConfirmation(editingCollection)}
                onImageUpload={handleImageUpload}
                isPending={isPending}
              />
            ) : null}
          </div>
        </div>
      )}

      <div className={`lg:grid lg:grid-cols-12 lg:min-h-screen ${isEditing ? 'lg:grid-flow-col' : ''}`}>
        {/* Collections Content Area */}
        <div className={`border-gray-300 lg:overflow-y-auto lg:h-full transition-all ${isEditing ? 'lg:col-span-7 lg:border-r' : 'lg:col-span-12'}`}>
          {/* Header */}
          <div className="lg:mx-6 lg:mt-2 lg:mb-0">
            <div className="w-full flex items-center justify-center lg:justify-between p-6 lg:px-2 bg-white">
              <div className="flex flex-col items-start gap-1">
                <h2 className="text-3xl font-bold lg:text-4xl">Collections</h2>
                <span className="hidden lg:block text-sm">
                  {collections.length > 1 ? `${collections.length} collections` : `${collections.length} collection`}
                </span>
              </div>
              {/* Desktop Plus Button */}
              <button onClick={handleCreateCollection} className="hidden lg:block hover:text-gray-600">
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
                    {collections.length > 1 ? `${collections.length} collections` : `${collections.length} collection`}
                  </span>
                </button>
                <button onClick={handleCreateCollection} className="hover:text-gray-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Filter Panel */}
              <MobileFilterPanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filterSections={filterSections}
              />

              {/* Desktop: Filter Left, Collections Right */}
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

                {/* Right: Collections List */}
                <div className="flex-1 flex flex-col gap-6">
                  {sortedCollections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => {
                        if (editingCollection === collection.id) {
                          handleEditCollection(null);
                        } else {
                          handleEditCollection(collection.id);
                        }
                      }}
                      className={`w-full h-32 relative overflow-hidden group flex duration-500 transition-all items-center justify-between px-6 ${
                        editingCollection === collection.id ? 'ring-2 ring-gray-700' : ''
                      }`}
                    >
                      <Image
                        src={collection.coverImage16x9}
                        alt={collection.translations['en-US'].name}
                        sizes="90vw"
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute inset-0 bg-linear-to-t from-gray-900/60 via-gray-900/20 to-transparent duration-500 transition-all ${
                        editingCollection === collection.id ? ' from-gray-900/80 via-gray-900/60 to-transparent' : ''
                        }`} />
                      <span className="relative z-10 text-3xl font-title text-white">
                        {collection.translations['en-US'].name}
                      </span>
                      <ChevronRight className={`relative z-10 w-8 h-8 text-white transition-transform ${editingCollection === collection.id ? 'rotate-90' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Collections Grid */}
              <div className="lg:hidden flex flex-col gap-4 mx-4 mb-4">
                {sortedCollections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => {
                      if (editingCollection === collection.id) {
                        handleEditCollection(null);
                      } else {
                        handleEditCollection(collection.id);
                      }
                    }}
                    className={`w-full h-20 relative overflow-hidden group flex items-center justify-between px-6 ${
                      editingCollection === collection.id ? 'ring-2 ring-gray-700' : ''
                    }`}
                  >
                    <Image
                      src={collection.coverImage16x9}
                      alt={collection.translations['en-US'].name}
                      sizes="98vw"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-gray-900/60 via-gray-900/20 to-transparent" />
                    <span className="relative z-10 text-2xl font-title text-white">
                      {collection.translations['en-US'].name}
                    </span>
                    <ChevronRight className={`relative z-10 w-6 h-6 text-white transition-transform ${editingCollection === collection.id ? 'rotate-90' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Edit Form (Desktop Only) */}
        {isEditing && (
          <div className="hidden lg:block lg:col-span-5 bg-gray-100 p-16 lg:overflow-y-auto lg:h-full">
            {isCreating && (
              <CollectionEditForm
                key="new-collection"
                collection={null}
                onCancel={clearAllEditing}
                onSubmit={handleSubmitNewCollection}
                onImageUpload={handleImageUpload}
                isPending={isPending}
              />
            )}
            {!isCreating && editingCollection !== null && (
              <CollectionEditForm
                key={editingCollection}
                collection={collections.find(c => c.id === editingCollection)!}
                onCancel={clearAllEditing}
                onSubmit={(updatedCollection) => handleUpdateCollection(editingCollection, updatedCollection)}
                onDelete={() => setDeleteConfirmation(editingCollection)}
                onImageUpload={handleImageUpload}
                isPending={isPending}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
