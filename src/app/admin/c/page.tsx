'use client';

import { useState } from 'react';
import { ChevronRight, Plus, Eye, X } from 'lucide-react';
import LanguageSelector, { type Locale } from '@/components/ui/LanguageSelector';
import ProductFilters, { FilterSection } from '@/components/ProductFilters';
import MobileFilterPanel from '@/components/MobileFilterPanel';
import Image from 'next/image';

// Style constants
const INPUT_STYLE = "w-full text-sm px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic";
const SUBMIT_BUTTON = "max-w-30 bg-gray-900 text-white px-3 py-2 text-base hover:bg-gray-700 transition-colors";
const CANCEL_BUTTON = "max-w-30 bg-white text-gray-900 px-3 py-2 text-base border border-gray-900 hover:bg-gray-300 transition-colors";
const DELETE_BUTTON = "max-w-30 bg-red-700 text-red-100 px-3 py-2 text-base border border-red-900 hover:bg-red-900 transition-colors";

// Dummy data for collections
const DUMMY_COLLECTIONS = [
  {
    id: 1,
    slug: 'greek-mythology',
    coverImageDesktop: '/promo/collection-gm-sq.jpg',
    coverImageMobile: '/promo/collection-gm-m.jpg',
    translations: {
      'en-US': { name: 'Greek Mythology', description: 'Inspired by the most famous tragedies in Greek mythology' },
      'fr-FR': { name: 'Mythologie Grecque', description: 'Inspire par les tragedies les plus celebres de la mythologie grecque' },
      'zh-TW': { name: 'Greek Mythology TW', description: 'Inspired by Greek mythology tragedies' },
    }
  }
];

type Collection = typeof DUMMY_COLLECTIONS[number];

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>(DUMMY_COLLECTIONS);
  const [editingCollection, setEditingCollection] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // Filter sections - only "Sort By" for this page
  const filterSections: FilterSection[] = [
    {
      id: 'sort',
      title: 'Sort By',
      type: 'radio',
      options: [
        { id: 'default', label: 'Create Order' },
        { id: 'update-time', label: 'Update Time' },
        { id: 'name-asc', label: 'Name A-Z' },
        { id: 'name-desc', label: 'Name Z-A' },
      ],
      value: sortBy,
      onChange: (value) => setSortBy(value as string),
    },
  ];

  const clearAllEditing = () => {
    setEditingCollection(null);
    setIsCreating(false);
  };

  const handleEditCollection = (id: number | null) => {
    clearAllEditing();
    setEditingCollection(id);
  };

  const handleCreateCollection = () => {
    clearAllEditing();
    setIsCreating(true);
  };

  const handleSubmitNewCollection = (newCollection: Omit<Collection, 'id'>) => {
    const maxId = collections.length > 0 ? Math.max(...collections.map(c => c.id)) : 0;
    const collectionWithId: Collection = {
      ...newCollection,
      id: maxId + 1,
    };
    setCollections([...collections, collectionWithId]);
    setIsCreating(false);
  };

  const handleUpdateCollection = (id: number, updatedCollection: Omit<Collection, 'id'>) => {
    setCollections(collections.map(c =>
      c.id === id ? { ...updatedCollection, id } : c
    ));
    setEditingCollection(null);
  };

  const handleDeleteCollection = (id: number) => {
    setCollections(collections.filter(c => c.id !== id));
    setEditingCollection(null);
    setDeleteConfirmation(null);
  };

  const confirmDelete = () => {
    if (deleteConfirmation !== null) {
      handleDeleteCollection(deleteConfirmation);
    }
  };

  const isEditing = editingCollection !== null || isCreating;

  return (
    <div className="lg:min-h-screen bg-white">
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
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className={DELETE_BUTTON}
              >
                Delete
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
              />
            ) : editingCollection !== null ? (
              <CollectionEditForm
                collection={collections.find(c => c.id === editingCollection)!}
                onCancel={clearAllEditing}
                onSubmit={(updatedCollection) => handleUpdateCollection(editingCollection, updatedCollection)}
                onDelete={() => setDeleteConfirmation(editingCollection)}
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
            <div className="border-t  border-gray-500">
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
                <div className="w-48 flex-shrink-0">
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

                {/* Right: Collections Grid */}
                <div className="flex-1 flex flex-col gap-6">
                  {collections.map((collection) => (
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
                        src={collection.coverImageMobile}
                        alt={collection.translations['en-US'].name}
                        fill
                        className="object-cover "
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
                {collections.map((collection) => (
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
                      src={collection.coverImageMobile}
                      alt={collection.translations['en-US'].name}
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
                onCancel={() => setIsCreating(false)}
                onSubmit={handleSubmitNewCollection}
              />
            )}
            {!isCreating && editingCollection !== null && (
              <CollectionEditForm
                key={editingCollection}
                collection={collections.find(c => c.id === editingCollection)!}
                onCancel={() => setEditingCollection(null)}
                onSubmit={(updatedCollection) => handleUpdateCollection(editingCollection, updatedCollection)}
                onDelete={() => setDeleteConfirmation(editingCollection)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Collection Edit Form Component
function CollectionEditForm({
  collection,
  onCancel,
  onSubmit,
  onDelete,
}: {
  collection: Collection | null;
  onCancel: () => void;
  onSubmit: (collection: Omit<Collection, 'id'>) => void;
  onDelete?: () => void;
}) {
  const isNew = collection === null;
  const [selectedLocale, setSelectedLocale] = useState<Locale>('en-US');
  const [slug, setSlug] = useState(collection?.slug || '');
  const [coverImageDesktop, setCoverImageDesktop] = useState(collection?.coverImageDesktop || '');
  const [coverImageMobile, setCoverImageMobile] = useState(collection?.coverImageMobile || '');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Collection['translations']>(
    collection?.translations || {
      'en-US': { name: '', description: '' },
      'fr-FR': { name: '', description: '' },
      'zh-TW': { name: '', description: '' },
    }
  );

  const handleSubmit = () => {
    onSubmit({
      slug,
      coverImageDesktop,
      coverImageMobile,
      translations,
    });
  };

  return (
    <div>
      <h3 className="block text-xl text-center lg:text-4xl lg:text-left font-bold pb-3 mb-3 border-b border-gray-500 lg:border-0 lg:pb-0 lg:mb-8">
        {isNew ? 'New Collection' : 'Edit Collection'}
      </h3>

      {/* Desktop Images Section */}
      <div className="hidden xl:flex justify-between gap-6 mb-6">
        {/* 16:9 Promotional Image */}
        <div className="flex-1">
          <div
            className={`relative h-40 bg-gray-200 hover:bg-gray-500 transition-colors cursor-pointer group overflow-hidden ${
              coverImageMobile ? 'bg-cover bg-center' : ''
            }`}
            style={coverImageMobile ? { backgroundImage: `url(${coverImageMobile})` } : {}}
          >
            {/* Overlay */}
            {coverImageMobile && (
              <div className="absolute inset-0 bg-gray-700/20 group-hover:bg-gray-900/20 transition-colors" />
            )}

            {/* Description */}
            <div className={`absolute w-full h-full text-center content-center text-sm font-medium transition group-hover:-top-1/6 ${
              coverImageMobile ? 'text-gray-100' : 'text-gray-900 group-hover:text-gray-700'
            }`}>
              16:9 Promotional <span className="text-red-600">*</span>
            </div>

            {/* Upload/Change Button - shows on hover */}
            <div className="absolute inset-0 flex top-1/5 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle upload
                }}
                className="bg-gray-900 text-white px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
              >
                {coverImageMobile ? 'Change' : 'Upload'}
              </button>
            </div>
          </div>
        </div>

        {/* 1:1 Promotional Image */}
        <div className="w-40">
          <div
            className={`relative h-40 bg-gray-200 hover:bg-gray-500 transition-colors cursor-pointer group overflow-hidden ${
              coverImageDesktop ? 'bg-cover bg-center' : ''
            }`}
            style={coverImageDesktop ? { backgroundImage: `url(${coverImageDesktop})` } : {}}
          >
            {/* Overlay */}
            {coverImageDesktop && (
              <div className="absolute inset-0 bg-gray-700/20 group-hover:bg-gray-900/20 transition-colors" />
            )}

            {/* Description */}
            <div className={`absolute w-full h-full text-center content-center text-sm font-medium transition group-hover:-top-1/6 ${
              coverImageDesktop ? 'text-gray-100' : 'text-gray-900 group-hover:text-gray-700'
            }`}>
              1:1 Promotional <span className="text-red-600">*</span>
            </div>

            {/* Upload/Change Button - shows on hover */}
            <div className="absolute inset-0 flex top-1/5 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle upload
                }}
                className="bg-gray-900 text-white px-6 py-2 text-sm hover:bg-gray-700 transition-colors"
              >
                {coverImageDesktop ? 'Change' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6 lg:px-6 xl:px-12">
        {/* Collection Unique Name */}
        <div className="mx-6 lg:mx-0">
          <label className="block text-sm font-medium mb-2">
            Collection Unique Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Address bar will be /c/name"
            className={INPUT_STYLE}
          />
        </div>

        {/* Images Section */}
        <div className="mx-6 lg:mx-0 xl:hidden">
          <h4 className="text-sm font-medium mb-4">Images</h4>

          {/* 16:9 Promotional */}
          <div className="mb-4 ml-4">
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center">
                <label className="text-sm w-32">
                  16:9 Promotional <span className="text-red-600">*</span>
                </label>
                <button
                  onClick={() => coverImageMobile && setPreviewImage(coverImageMobile)}
                  className={`${coverImageMobile ? 'text-gray-900' : 'text-gray-500'} hover:opacity-70 transition-opacity`}
                  disabled={!coverImageMobile}
                >
                  <Eye className="w-6 h-6" />
                </button>
              </div>
              <button className={`${coverImageMobile ? 'bg-gray-900' : 'bg-gray-500'} text-white w-20 px-4 py-2 text-sm hover:opacity-80 transition-opacity`}>
                {coverImageMobile ? 'Change' : 'Upload'}
              </button>
            </div>
          </div>

          {/* 1:1 Promotional */}
          <div className="ml-4">
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center">
                <label className="text-sm w-32">
                  1:1 Promotional <span className="text-red-600">*</span>
                </label>
                <button
                  onClick={() => coverImageDesktop && setPreviewImage(coverImageDesktop)}
                  className={`${coverImageDesktop ? 'text-gray-900' : 'text-gray-500'} hover:opacity-70 transition-opacity`}
                  disabled={!coverImageDesktop}
                >
                  <Eye className="w-6 h-6" />
                </button>
              </div>
              <button className={`${coverImageDesktop ? 'bg-gray-900' : 'bg-gray-500'} text-white w-20 px-4 py-2 text-sm hover:opacity-80 transition-opacity`}>
                {coverImageDesktop ? 'Change' : 'Upload'}
              </button>
            </div>
          </div>
        </div>

        {/* Image Preview Overlay */}
        {previewImage && (
          <div
            className="fixed inset-0 h-screen bg-gray-900/50 z-90 backdrop-blur-sm transition-all duration-500 flex items-center justify-center"
            onClick={() => setPreviewImage(null)}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-gray-100 hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div
              className="relative max-w-5xl max-h-[90vh] w-full h-full"
            >
              <Image
                src={previewImage}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Language Selector */}
        <LanguageSelector
          value={selectedLocale}
          onChange={(locale) => {
            setSelectedLocale(locale);
          }}
        />

        {/* Localized Collection Name */}
        <div className="mx-6 lg:mx-0">
          <label className="block text-sm font-medium mb-2">
            Localized Collection Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={translations[selectedLocale].name}
            onChange={(e) => setTranslations({
              ...translations,
              [selectedLocale]: {
                ...translations[selectedLocale],
                name: e.target.value,
              }
            })}
            placeholder="Name appears on the site"
            className={INPUT_STYLE}
          />
        </div>

        {/* Description */}
        <div className="mx-6 lg:mx-0">
          <label className="block text-sm font-medium mb-2">
            Description of collection <span className="text-red-600">*</span>
          </label>
          <textarea
            value={translations[selectedLocale].description}
            onChange={(e) => setTranslations({
              ...translations,
              [selectedLocale]: {
                ...translations[selectedLocale],
                description: e.target.value,
              }
            })}
            placeholder="Description appears below the product"
            rows={4}
            className={INPUT_STYLE}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4 px-6 lg:pt-0 lg:mx-0 border-t lg:border-0 border-gray-500">
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className={SUBMIT_BUTTON}
            >
              Submit
            </button>
            <button
              onClick={onCancel}
              className={CANCEL_BUTTON}
            >
              Cancel
            </button>
          </div>
          {!isNew && onDelete && (
            <button
              onClick={onDelete}
              className={DELETE_BUTTON}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
