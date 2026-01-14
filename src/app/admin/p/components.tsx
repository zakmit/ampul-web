'use client';

import { useState, useRef, useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import LanguageSelector, { type Locale } from '@/components/ui/LanguageSelector';
import Image from 'next/image';

// Style constants
export const INPUT_STYLE = "min-h-8 w-full lg:w-60 text-sm px-4 py-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic";
export const INPUT_STYLE_ERROR = "min-h-8 w-full lg:w-60 text-sm px-4 py-1 bg-white border border-red-700 rounded-md focus:outline-none focus:ring-1 focus:ring-red-700 placeholder:italic";
export const SELECT_STYLE = "w-full h-8 lg:w-60 text-sm px-4 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 appearance-none pr-10";
export const SELECT_STYLE_ERROR = "w-full h-8 lg:w-60 text-sm px-4 bg-white border border-red-700 rounded-md focus:outline-none focus:ring-1 focus:ring-red-700 appearance-none pr-10";
export const SUBMIT_BUTTON = "max-w-30 bg-gray-900 text-white px-3 py-2 text-base hover:bg-gray-700 transition-colors disabled:opacity-50";
export const CANCEL_BUTTON = "max-w-30 bg-white text-gray-900 px-3 py-2 text-base border border-gray-900 hover:bg-gray-300 transition-colors disabled:opacity-50";
export const DELETE_BUTTON = "max-w-30 bg-red-700 text-red-100 px-3 py-2 text-base border border-red-900 hover:bg-red-900 transition-colors disabled:opacity-50";

// Searchable Dropdown Component
function SearchableDropdown({
  label,
  selectedIds,
  items,
  onToggle,
  getItemLabel,
  placeholder = 'Search...',
  error = false,
}: {
  label: string;
  selectedIds: number[];
  items: { id: number; label: string }[];
  onToggle: (id: number) => void;
  getItemLabel?: (item: { id: number; label: string }) => string;
  placeholder?: string;
  error?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItems = items.filter(item => selectedIds.includes(item.id));
  const displayLabel = getItemLabel || ((item: { id: number; label: string }) => item.label);

  return (
    <div className="mx-6 lg:mx-0 lg:flex lg:items-start lg:justify-between lg:gap-4">
      <label className="block lg:w-48 text-sm font-medium mb-2 lg:mb-0 lg:pt-2">{label}</label>
      <div className="relative lg:w-60" ref={dropdownRef}>
        {/* Display selected items with X buttons */}
        <div
          className={`min-h-8 border text-center rounded-md px-2 py-1 cursor-pointer flex overflow-x-auto gap-2 ${
            error ? 'border-red-700' : 'border-gray-300'
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedItems.map(item => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 bg-olive-200 border rounded-md text-olive-900 border-olive-600 px-2 text-xs"
            >
              {displayLabel(item)}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(item.id);
                }}
                className="text-gray-700 hover:text-gray-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedItems.length === 0 && (
            <span className="text-gray-500 px-2 text-center italic text-sm">{placeholder}</span>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 placeholder:italic focus:ring-gray-900"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="p-1">
              {filteredItems.length === 0 ? (
                <div className="text-sm text-gray-500 p-2">No results found</div>
              ) : (
                filteredItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(item.id);
                    }}
                    className={`w-full text-left text-sm px-3 py-2 hover:bg-olive-300 rounded-md ${
                      selectedIds.includes(item.id) ? 'bg-olive-100 font-bold' : ''
                    }`}
                  >
                    {displayLabel(item)}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Type definitions
export type Category = {
  id: number;
  slug: string;
  translations: Record<Locale, { name: string }>;
};

export type Collection = {
  id: number;
  slug: string;
  translations: Record<Locale, { name: string }>;
};

export type Volume = {
  id: number;
  value: string;
  translations: Record<Locale, { displayName: string }>;
};

export type Tag = {
  id: number;
  slug: string;
  translations: Record<Locale, { name: string }>;
};

export type Product = {
  id: string;
  slug: string;
  categoryId: number;
  collectionId: number;
  coverImage1x1: string;
  coverImage16x9: string;
  productImage: string;
  boxImage: string;
  galleryImages: string[];
  translations: Record<Locale, { name: string; concept: string; sensations: string }>;
  volumes: {
    volumeId: number;
    prices: Record<Locale, { price: number; stock: number | null }>;
  }[];
  tagIds: number[];
};

// Product Edit Form Component
export function ProductEditForm({
  product,
  categories,
  collections,
  volumes,
  tags,
  onCancel,
  onSubmit,
  onDelete,
  onImageUpload,
  isPending,
}: {
  product: Product | null;
  categories: Category[];
  collections: Collection[];
  volumes: Volume[];
  tags: Tag[];
  onCancel: () => void;
  onSubmit: (product: Omit<Product, 'id'>) => void;
  onDelete?: () => void;
  onImageUpload: (file: File, imageType: 'desktop' | 'mobile' | 'product' | 'box' | 'gallery') => Promise<string | null>;
  isPending: boolean;
}) {
  const isNew = product === null;
  const [selectedLocale, setSelectedLocale] = useState<Locale>('en-US');
  const [slug, setSlug] = useState(product?.slug || '');

  // Set default to first category/collection if available, otherwise 0
  const [categoryId, setCategoryId] = useState(product?.categoryId || (categories.length > 0 ? categories[0].id : 0));
  const [collectionId, setCollectionId] = useState(product?.collectionId || (collections.length > 0 ? collections[0].id : 0));
  const [coverImage1x1, setCoverImageDesktop] = useState(product?.coverImage1x1 || '');
  const [coverImage16x9, setCoverImageMobile] = useState(product?.coverImage16x9 || '');
  const [productImage, setProductImage] = useState(product?.productImage || '');
  const [boxImage, setBoxImage] = useState(product?.boxImage || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(product?.galleryImages || []);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedVolumes, setSelectedVolumes] = useState<number[]>(
    product?.volumes.map(v => v.volumeId) || []
  );
  const [selectedTags, setSelectedTags] = useState<number[]>(product?.tagIds || []);
  const [translations, setTranslations] = useState<Product['translations']>(
    product?.translations || {
      'en-US': { name: '', concept: '', sensations: '' },
      'fr-FR': { name: '', concept: '', sensations: '' },
      'zh-TW': { name: '', concept: '', sensations: '' },
    }
  );
  const [volumePrices, setVolumePrices] = useState<Record<number, Record<Locale, { price: number; stock: number | null }>>>(
    product?.volumes.reduce((acc, v) => {
      acc[v.volumeId] = v.prices;
      return acc;
    }, {} as Record<number, Record<Locale, { price: number; stock: number | null }>>) || {}
  );
  const [validationErrors, setValidationErrors] = useState({
    slug: false,
    categoryId: false,
    collectionId: false,
    name: false,
    concept: false,
    sensations: false,
    coverImage1x1: false,
    coverImage16x9: false,
    productImage: false,
    boxImage: false,
    volumes: false,
  });
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  const boxInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>, imageType: 'desktop' | 'mobile' | 'product' | 'box' | 'gallery') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(imageType);

    try {
      const url = await onImageUpload(file, imageType);
      if (url) {
        if (imageType === 'desktop') {
          setCoverImageDesktop(url);
          if (validationErrors.coverImage1x1) {
            setValidationErrors({ ...validationErrors, coverImage1x1: false });
          }
        } else if (imageType === 'mobile') {
          setCoverImageMobile(url);
          if (validationErrors.coverImage16x9) {
            setValidationErrors({ ...validationErrors, coverImage16x9: false });
          }
        } else if (imageType === 'product') {
          setProductImage(url);
          if (validationErrors.productImage) {
            setValidationErrors({ ...validationErrors, productImage: false });
          }
        } else if (imageType === 'box') {
          setBoxImage(url);
          if (validationErrors.boxImage) {
            setValidationErrors({ ...validationErrors, boxImage: false });
          }
        } else if (imageType === 'gallery') {
          setGalleryImages([...galleryImages, url]);
        }
      }
    } finally {
      setIsUploading(null);
      event.target.value = '';
    }
  };

  const handleVolumeToggle = (volumeId: number) => {
    if (selectedVolumes.includes(volumeId)) {
      setSelectedVolumes(selectedVolumes.filter(v => v !== volumeId));
      const newPrices = { ...volumePrices };
      delete newPrices[volumeId];
      setVolumePrices(newPrices);
    } else {
      setSelectedVolumes([...selectedVolumes, volumeId]);
      // Initialize prices for this volume
      if (!volumePrices[volumeId]) {
        setVolumePrices({
          ...volumePrices,
          [volumeId]: {
            'en-US': { price: 0, stock: null },
            'fr-FR': { price: 0, stock: null },
            'zh-TW': { price: 0, stock: null },
          },
        });
      }
    }
    if (validationErrors.volumes) {
      setValidationErrors({ ...validationErrors, volumes: false });
    }
  };

  const handleTagToggle = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = () => {
    // Check if categories and collections are available
    if (categories.length === 0 || collections.length === 0) {
      alert('Cannot create product: Categories and Collections are required. Please create them first.');
      return;
    }

    // Validate required fields
    const errors = {
      slug: !slug.trim(),
      categoryId: categoryId === 0,
      collectionId: collectionId === 0,
      name: !translations['en-US'].name.trim(),
      concept: !translations['en-US'].concept.trim(),
      sensations: !translations['en-US'].sensations.trim(),
      coverImage1x1: !coverImage1x1.trim(),
      coverImage16x9: !coverImage16x9.trim(),
      productImage: !productImage.trim(),
      boxImage: !boxImage.trim(),
      volumes: selectedVolumes.length === 0,
    };

    setValidationErrors(errors);

    if (Object.values(errors).some(e => e)) {
      return;
    }

    onSubmit({
      slug,
      categoryId,
      collectionId,
      coverImage1x1,
      coverImage16x9,
      productImage,
      boxImage,
      galleryImages,
      translations,
      volumes: selectedVolumes.map(volumeId => ({
        volumeId,
        prices: volumePrices[volumeId] || {
          'en-US': { price: 0, stock: null },
          'fr-FR': { price: 0, stock: null },
          'zh-TW': { price: 0, stock: null },
        },
      })),
      tagIds: selectedTags,
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  return (
    <div className="lg:grid lg:grid-flow-col lg:content-center justify-around lg:h-screen">
      {/* Mobile Header */}
      <h3 className="block text-xl text-center font-bold pb-3 mb-3 border-b border-gray-500 lg:hidden">
        {isNew ? 'Edit Product' : 'Edit Product'}
      </h3>

      {/* Left Side - Images (Desktop Only) */}
      <div className="hidden lg:flex lg:flex-col w-124 bg-white py-8 overflow-y-auto">
        <h3 className="text-4xl font-bold mb-8">
          {isNew ? 'Edit Product' : 'Edit Product'}
        </h3>

        {/* Top Row: 16:9 and 1:1 Promotional */}
        <div className="flex gap-6 mb-6">
          {/* 16:9 Promotional - 302px x 170px */}
          <div
            onClick={() => !isUploading && mobileInputRef.current?.click()}
            className={`relative bg-gray-200 hover:bg-gray-500 shadow-md/30 transition-colors cursor-pointer group overflow-hidden ${
              validationErrors.coverImage16x9 ? 'bg-red-700' : ''
            }`}
            style={{ width: '302px', height: '170px' }}
          >
            {coverImage16x9 && (
              <Image src={coverImage16x9} alt="16:9 Promotional" fill className="object-cover" />
            )}
            {coverImage16x9 && (
              <div className="absolute inset-0 bg-gray-700/20 group-hover:bg-gray-900/20 transition-colors" />
            )}
            <div className={`absolute w-full h-full flex items-center justify-center text-sm font-medium transition group-hover:-top-1/6 ${
              coverImage16x9 ? 'text-gray-100' : 'text-gray-900 group-hover:text-gray-700'
            }`}>
              16:9 Promotional <span className="text-red-600">*</span>
            </div>
            <div className="absolute inset-0 flex top-1/5 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={(e) => { e.stopPropagation(); mobileInputRef.current?.click(); }}
                className="bg-gray-900 text-white px-6 py-2 text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={isUploading !== null}>
                {isUploading === 'mobile' ? 'Uploading...' : (coverImage16x9 ? 'Change' : 'Upload')}
              </button>
            </div>
          </div>
          <input ref={mobileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleImageSelect(e, 'mobile')} className="hidden" />

          {/* 1:1 Promotional - 170px x 170px */}
          <div
            onClick={() => !isUploading && desktopInputRef.current?.click()}
            className={`relative bg-gray-200 hover:bg-gray-500 shadow-md/30 transition-colors cursor-pointer group overflow-hidden ${
              validationErrors.coverImage1x1 ? 'bg-red-700' : ''
            }`}
            style={{ width: '170px', height: '170px' }}
          >
            {coverImage1x1 && (
              <Image src={coverImage1x1} alt="1:1 Promotional" fill className="object-cover" />
            )}
            {coverImage1x1 && (
              <div className="absolute inset-0 bg-gray-700/20 group-hover:bg-gray-900/20 transition-colors" />
            )}
            <div className={`absolute w-full h-full flex items-center justify-center text-sm font-medium transition group-hover:-top-1/6 ${
              coverImage1x1 ? 'text-gray-100' : 'text-gray-900 group-hover:text-gray-700'
            }`}>
              1:1 Promotional <span className="text-red-600">*</span>
            </div>
            <div className="absolute inset-0 flex top-1/5 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={(e) => { e.stopPropagation(); desktopInputRef.current?.click(); }}
                className="bg-gray-900 text-white px-6 py-2 text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={isUploading !== null}>
                {isUploading === 'desktop' ? 'Uploading...' : (coverImage1x1 ? 'Change' : 'Upload')}
              </button>
            </div>
          </div>
          <input ref={desktopInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleImageSelect(e, 'desktop')} className="hidden" />
        </div>

        {/* Middle Row: Product and Box - 236px x 236px each */}
        <div className="flex gap-6 mb-6">
          {/* Product Image */}
          <div
            onClick={() => !isUploading && productInputRef.current?.click()}
            className={`relative bg-gray-200 hover:bg-gray-500 shadow-md/30 transition-colors cursor-pointer group overflow-hidden ${
              validationErrors.productImage ? 'bg-red-700' : ''
            }`}
            style={{ width: '236px', height: '236px' }}
          >
            {productImage && (
              <Image src={productImage} alt="Product" fill className="object-cover" />
            )}
            {productImage && (
              <div className="absolute inset-0 bg-gray-700/20 group-hover:bg-gray-900/20 transition-colors" />
            )}
            <div className={`absolute w-full h-full flex items-center justify-center text-sm font-medium transition group-hover:-top-1/9 ${
              productImage ? 'text-gray-100' : 'text-gray-900 group-hover:text-gray-700'
            }`}>
              Product <span className="text-red-600">*</span>
            </div>
            <div className="absolute inset-0 flex top-1/5 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={(e) => { e.stopPropagation(); productInputRef.current?.click(); }}
                className="bg-gray-900 text-white px-6 py-2 text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={isUploading !== null}>
                {isUploading === 'product' ? 'Uploading...' : (productImage ? 'Change' : 'Upload')}
              </button>
            </div>
          </div>
          <input ref={productInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleImageSelect(e, 'product')} className="hidden" />

          {/* Box Image */}
          <div
            onClick={() => !isUploading && boxInputRef.current?.click()}
            className={`relative bg-gray-200 hover:bg-gray-500 shadow-md/30 transition-colors cursor-pointer group overflow-hidden ${
              validationErrors.boxImage ? 'bg-red-700' : ''
            }`}
            style={{ width: '236px', height: '236px' }}
          >
            {boxImage && (
              <Image src={boxImage} alt="Box" fill className="object-cover" />
            )}
            {boxImage && (
              <div className="absolute inset-0 bg-gray-700/20 group-hover:bg-gray-900/20 transition-colors" />
            )}
            <div className={`absolute w-full h-full flex items-center justify-center text-sm font-medium transition group-hover:-top-1/9 ${
              boxImage ? 'text-gray-100' : 'text-gray-900 group-hover:text-gray-700'
            }`}>
              Box <span className="text-red-600">*</span>
            </div>
            <div className="absolute inset-0 flex top-1/5 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={(e) => { e.stopPropagation(); boxInputRef.current?.click(); }}
                className="bg-gray-900 text-white px-6 py-2 text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={isUploading !== null}>
                {isUploading === 'box' ? 'Uploading...' : (boxImage ? 'Change' : 'Upload')}
              </button>
            </div>
          </div>
          <input ref={boxInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleImageSelect(e, 'box')} className="hidden" />
        </div>

        {/* Gallery Images Section - Height 236px */}
        <div className="bg-gray-100 p-4 flex flex-col shadow-md/30 items-end" style={{ height: '236px' }}>
          <div className="flex-1 overflow-y-auto w-full">
            <div className="flex gap-4 overflow-x-auto">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="relative bg-gray-200 hover:bg-gray-500 group shrink-0 overflow-hidden" style={{ width: '160px', height: '160px' }}>
                  <Image src={img} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gray-700/20 group-hover:bg-gray-900/20 transition-colors" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeGalleryImage(idx); }}
                    className="absolute top-1 right-1 bg-red-700 text-white p-1 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-gray-900/70 text-white text-xs px-1 z-10">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); galleryInputRef.current?.click(); }}
                      className="bg-gray-900 text-white px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer transition-colors disabled:opacity-50"
                      disabled={isUploading !== null}
                    >
                      {isUploading === 'gallery' ? 'Wait...' : 'Change'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className=" bg-gray-900 text-white w-38 h-8 text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
            disabled={isUploading !== null}
          >
            {isUploading === 'gallery' ? 'Uploading...' : 'Add optional image'}
          </button>
          <input ref={galleryInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleImageSelect(e, 'gallery')} className="hidden" />
        </div>
      </div>

      {/* Right Side - Form Fields */}
      <div className="flex-1 bg-white overflow-y-auto content-center">
        <div className="space-y-6 p-6 lg:max-w-126 lg:py-4 lg:px-2">
        {/* Product Unique Name */}
        <div className="mx-6 lg:mx-0 lg:flex lg:justify-between lg:items-center lg:gap-4">
          <label className="block lg:w-48 text-sm font-medium mb-2 lg:mb-0">
            Product Unique Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              if (validationErrors.slug) {
                setValidationErrors({ ...validationErrors, slug: false });
              }
            }}
            placeholder="Address bar will be /p/name"
            className={validationErrors.slug ? INPUT_STYLE_ERROR : INPUT_STYLE}
            disabled={isPending || isUploading !== null}
          />
        </div>

        {/* Product Category */}
        <div className="mx-6 lg:mx-0 lg:flex lg:justify-between lg:items-center lg:gap-4">
          <label className="block lg:w-48 text-sm font-medium mb-2 lg:mb-0">
            Product Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(Number(e.target.value));
              if (validationErrors.categoryId) {
                setValidationErrors({ ...validationErrors, categoryId: false });
              }
            }}
            className={validationErrors.categoryId ? SELECT_STYLE_ERROR : SELECT_STYLE}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg fill='%23000000' height='24px' width='24px' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 28.769 28.769' xml:space='preserve'%3E%3Cg%3E%3Cg id='c106_arrow'%3E%3Cpath d='M28.678,5.798L14.713,23.499c-0.16,0.201-0.495,0.201-0.658,0L0.088,5.798C-0.009,5.669-0.027,5.501,0.04,5.353 C0.111,5.209,0.26,5.12,0.414,5.12H28.35c0.16,0,0.31,0.089,0.378,0.233C28.798,5.501,28.776,5.669,28.678,5.798z'/%3E%3C/g%3E%3Cg id='Capa_1_26_'%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1em 1em',
            }}
            disabled={isPending || isUploading !== null || categories.length === 0}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.translations['en-US']?.name || cat.slug}
              </option>
            ))}
          </select>
        </div>

        {/* Collection */}
        <div className="mx-6 lg:mx-0 lg:flex lg:justify-between lg:items-center lg:gap-4">
          <label className="block lg:w-48 text-sm font-medium mb-2 lg:mb-0">
            Collection
          </label>
          <select
            value={collectionId}
            onChange={(e) => {
              setCollectionId(Number(e.target.value));
              if (validationErrors.collectionId) {
                setValidationErrors({ ...validationErrors, collectionId: false });
              }
            }}
            className={validationErrors.collectionId ? SELECT_STYLE_ERROR : SELECT_STYLE}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg fill='%23000000' height='24px' width='24px' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 28.769 28.769' xml:space='preserve'%3E%3Cg%3E%3Cg id='c106_arrow'%3E%3Cpath d='M28.678,5.798L14.713,23.499c-0.16,0.201-0.495,0.201-0.658,0L0.088,5.798C-0.009,5.669-0.027,5.501,0.04,5.353 C0.111,5.209,0.26,5.12,0.414,5.12H28.35c0.16,0,0.31,0.089,0.378,0.233C28.798,5.501,28.776,5.669,28.678,5.798z'/%3E%3C/g%3E%3Cg id='Capa_1_26_'%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1em 1em',
            }}
            disabled={isPending || isUploading !== null || collections.length === 0}
          >
            {collections.map(col => (
              <option key={col.id} value={col.id}>
                {col.translations['en-US']?.name || col.slug}
              </option>
            ))}
          </select>
        </div>

        {/* Tags - Searchable Dropdown */}
        <SearchableDropdown
          label="Tags"
          selectedIds={selectedTags}
          items={tags.map(tag => ({
            id: tag.id,
            label: tag.translations['en-US']?.name || tag.slug,
          }))}
          onToggle={handleTagToggle}
          placeholder="Click to select tags..."
        />

        {/* Volumes - Searchable Dropdown */}
        <SearchableDropdown
          label="Volumes *"
          selectedIds={selectedVolumes}
          items={volumes.map(vol => ({
            id: vol.id,
            label: vol.value,
          }))}
          onToggle={handleVolumeToggle}
          placeholder="Click to select volumes..."
          error={validationErrors.volumes}
        />

        {/* Images Section (Mobile/Tablet) */}
        <div className="mx-6 lg:mx-0 lg:hidden">
          <h4 className="text-sm font-medium mb-4">Images</h4>

          {/* 16:9 Promotional */}
          <div className="mb-4 ml-4">
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center">
                <label className="text-sm w-32">
                  16:9 Promotional <span className="text-red-600">*</span>
                </label>
                <button type="button" onClick={() => coverImage16x9 && setPreviewImage(coverImage16x9)}
                  className={`${coverImage16x9 ? 'text-gray-900' : 'text-gray-500'} hover:opacity-70 transition-opacity`}
                  disabled={!coverImage16x9}>
                  <Eye className="w-6 h-6" />
                </button>
              </div>
              <button type="button" onClick={() => mobileInputRef.current?.click()}
                className={`w-20 py-2 text-sm disabled:opacity-50 ${
                  validationErrors.coverImage16x9
                    ? 'bg-red-700 text-red-100 border border-red-900 hover:bg-red-900 transition-colors'
                    : coverImage16x9
                      ? 'bg-gray-900 text-white hover:opacity-80 transition-opacity'
                      : 'bg-gray-500 text-white hover:opacity-80 transition-opacity'
                }`}
                disabled={isUploading !== null}>
                {isUploading === 'mobile' ? 'Wait...' : validationErrors.coverImage16x9 ? 'Required' : (coverImage16x9 ? 'Change' : 'Upload')}
              </button>
            </div>
          </div>

          {/* 1:1 Promotional */}
          <div className="mb-4 ml-4">
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center">
                <label className="text-sm w-32">
                  1:1 Promotional <span className="text-red-600">*</span>
                </label>
                <button type="button" onClick={() => coverImage1x1 && setPreviewImage(coverImage1x1)}
                  className={`${coverImage1x1 ? 'text-gray-900' : 'text-gray-500'} hover:opacity-70 transition-opacity`}
                  disabled={!coverImage1x1}>
                  <Eye className="w-6 h-6" />
                </button>
              </div>
              <button type="button" onClick={() => desktopInputRef.current?.click()}
                className={`w-20 py-2 text-sm disabled:opacity-50 ${
                  validationErrors.coverImage1x1
                    ? 'bg-red-700 text-red-100 border border-red-900 hover:bg-red-900 transition-colors'
                    : coverImage1x1
                      ? 'bg-gray-900 text-white hover:opacity-80 transition-opacity'
                      : 'bg-gray-500 text-white hover:opacity-80 transition-opacity'
                }`}
                disabled={isUploading !== null}>
                {isUploading === 'desktop' ? 'Wait...' : validationErrors.coverImage1x1 ? 'Required' : (coverImage1x1 ? 'Change' : 'Upload')}
              </button>
            </div>
          </div>

          {/* Product Image */}
          <div className="mb-4 ml-4">
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center">
                <label className="text-sm w-32">
                  Product <span className="text-red-600">*</span>
                </label>
                <button type="button" onClick={() => productImage && setPreviewImage(productImage)}
                  className={`${productImage ? 'text-gray-900' : 'text-gray-500'} hover:opacity-70 transition-opacity`}
                  disabled={!productImage}>
                  <Eye className="w-6 h-6" />
                </button>
              </div>
              <button type="button" onClick={() => productInputRef.current?.click()}
                className={`w-20 py-2 text-sm disabled:opacity-50 ${
                  validationErrors.productImage
                    ? 'bg-red-700 text-red-100 border border-red-900 hover:bg-red-900 transition-colors'
                    : productImage
                      ? 'bg-gray-900 text-white hover:opacity-80 transition-opacity'
                      : 'bg-gray-500 text-white hover:opacity-80 transition-opacity'
                }`}
                disabled={isUploading !== null}>
                {isUploading === 'product' ? 'Wait...' : validationErrors.productImage ? 'Required' : (productImage ? 'Change' : 'Upload')}
              </button>
            </div>
          </div>

          {/* Box Image */}
          <div className="mb-4 ml-4">
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center">
                <label className="text-sm w-32">
                  Box <span className="text-red-600">*</span>
                </label>
                <button type="button" onClick={() => boxImage && setPreviewImage(boxImage)}
                  className={`${boxImage ? 'text-gray-900' : 'text-gray-500'} hover:opacity-70 transition-opacity`}
                  disabled={!boxImage}>
                  <Eye className="w-6 h-6" />
                </button>
              </div>
              <button type="button" onClick={() => boxInputRef.current?.click()}
                className={`w-20 py-2 text-sm disabled:opacity-50 ${
                  validationErrors.boxImage
                    ? 'bg-red-700 text-red-100 border border-red-900 hover:bg-red-900 transition-colors'
                    : boxImage
                      ? 'bg-gray-900 text-white hover:opacity-80 transition-opacity'
                      : 'bg-gray-500 text-white hover:opacity-80 transition-opacity'
                }`}
                disabled={isUploading !== null}>
                {isUploading === 'box' ? 'Wait...' : validationErrors.boxImage ? 'Required' : (boxImage ? 'Change' : 'Upload')}
              </button>
            </div>
          </div>

          {/* Gallery Images */}
          {galleryImages.map((img, idx) => (
            <div key={idx} className="mb-4 ml-4">
              <div className="flex items-center gap-4 justify-between">
                <div className="flex items-center">
                  <label className="text-sm w-32">
                    Gallery {String(idx + 1).padStart(2, '0')}
                  </label>
                  <button type="button" onClick={() => setPreviewImage(img)}
                    className="text-gray-900 hover:opacity-70 mr-4 transition-opacity">
                    <Eye className="w-6 h-6" />
                  </button>
                  <button type="button" onClick={() => removeGalleryImage(idx)}
                    className="text-red-700 hover:opacity-50 transition-opacity">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <button type="button" onClick={() => galleryInputRef.current?.click()}
                  className="bg-gray-900 text-white w-20 py-2 text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
                  disabled={isUploading !== null}>
                  {isUploading === 'gallery' ? 'Wait...' : 'Change'}
                </button>
              </div>
            </div>
          ))}

          {/* Add optional Image button */}
          <div className="ml-4 mt-6 text-center">
            <button type="button" onClick={() => galleryInputRef.current?.click()}
              className="w-40 bg-gray-900 text-white py-2 text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
              disabled={isUploading !== null}>
              {isUploading === 'gallery' ? 'Uploading...' : 'Add optional image'}
            </button>
          </div>
        </div>

        {/* Image Preview Overlay */}
        {previewImage && (
          <div
            className="fixed inset-0 h-screen bg-gray-900/50 z-90 backdrop-blur-sm transition-all duration-500 flex items-center justify-center"
            onClick={() => setPreviewImage(null)}
          >
            <button onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-gray-100 hover:text-gray-300 transition-colors">
              <X className="w-8 h-8" />
            </button>
            <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
              <Image src={previewImage} alt="Preview" fill className="object-contain" />
            </div>
          </div>
        )}

        {/* Language Selector */}
        <div className="border-b border-gray-900 -mx-6 lg:mx-8 text-center">
          <LanguageSelector
            value={selectedLocale}
            onChange={(locale) => setSelectedLocale(locale)}
          />
        </div>

        {/* Localized Product Name */}
        <div className="mx-6 lg:mx-0 lg:flex lg:justify-between lg:items-center lg:gap-4">
          <label className="block lg:w-48 text-sm font-medium mb-2 lg:mb-0">
            Localized Product Name {selectedLocale === 'en-US' && <span className="text-red-600">*</span>}
          </label>
          <input
            type="text"
            value={translations[selectedLocale].name}
            onChange={(e) => {
              setTranslations({
                ...translations,
                [selectedLocale]: {
                  ...translations[selectedLocale],
                  name: e.target.value,
                }
              });
              if (selectedLocale === 'en-US' && validationErrors.name) {
                setValidationErrors({ ...validationErrors, name: false });
              }
            }}
            placeholder="Name appears on the site"
            className={selectedLocale === 'en-US' && validationErrors.name ? INPUT_STYLE_ERROR : INPUT_STYLE}
            disabled={isPending || isUploading !== null}
          />
        </div>

        {/* Concept of product */}
        <div className="mx-6 lg:mx-0 lg:flex lg:items-start lg:justify-between lg:gap-4">
          <label className="block lg:w-48 text-sm font-medium mb-2 lg:mb-0 lg:pt-2">
            Concept of product {selectedLocale === 'en-US' && <span className="text-red-600">*</span>}
          </label>
          <textarea
            value={translations[selectedLocale].concept}
            onChange={(e) => {
              setTranslations({
                ...translations,
                [selectedLocale]: {
                  ...translations[selectedLocale],
                  concept: e.target.value,
                }
              });
              if (selectedLocale === 'en-US' && validationErrors.concept) {
                setValidationErrors({ ...validationErrors, concept: false });
              }
            }}
            placeholder="Description appears below the product"
            rows={3}
            className={selectedLocale === 'en-US' && validationErrors.concept ? INPUT_STYLE_ERROR : INPUT_STYLE}
            disabled={isPending || isUploading !== null}
          />
        </div>

        {/* Sensation */}
        <div className="mx-6 lg:mx-0 lg:flex lg:items-start lg:justify-between lg:gap-4">
          <label className="block lg:w-48 text-sm font-medium mb-2 lg:mb-0">
            Sensation {selectedLocale === 'en-US' && <span className="text-red-600">*</span>}
          </label>
          <textarea
            value={translations[selectedLocale].sensations}
            onChange={(e) => {
              setTranslations({
                ...translations,
                [selectedLocale]: {
                  ...translations[selectedLocale],
                  sensations: e.target.value,
                }
              });
              if (selectedLocale === 'en-US' && validationErrors.sensations) {
                setValidationErrors({ ...validationErrors, sensations: false });
              }
            }}
            placeholder="How the costumer will feel?"
            rows={3}
            className={selectedLocale === 'en-US' && validationErrors.sensations ? INPUT_STYLE_ERROR : INPUT_STYLE}
            disabled={isPending || isUploading !== null}
          />
        </div>

        {/* Price section for selected volumes */}
        {selectedVolumes.length > 0 && (
          <div className="mx-6 lg:mx-0 lg:flex lg:items-start lg:gap-4">
            <label className="block lg:w-48 text-sm font-medium mb-2 lg:mb-0 lg:pt-2">
              Price <span className="text-red-600">*</span>
            </label>
            <div className="space-y-2 lg:w-60">
              {selectedVolumes.map(volumeId => {
                const volume = volumes.find(v => v.id === volumeId);
                if (!volume) return null;
                return (
                  <div key={volumeId} className="flex items-center gap-2 lg:justify-between">
                    <div className="w-29 h-8 content-center text-sm font-medium bg-gray-200 border border-gray-500 rounded-md px-3 text-center">
                      {volume.value}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={volumePrices[volumeId]?.[selectedLocale]?.price || 0}
                      onChange={(e) => {
                        const newPrice = parseFloat(e.target.value) || 0;
                        setVolumePrices({
                          ...volumePrices,
                          [volumeId]: {
                            ...volumePrices[volumeId],
                            [selectedLocale]: {
                              ...volumePrices[volumeId]?.[selectedLocale],
                              price: newPrice,
                            },
                          },
                        });
                      }}
                      placeholder="Price"
                      className={'min-h-8 w-full lg:w-29 text-sm px-4 py-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic'}
                      disabled={isPending || isUploading !== null}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4 px-6 lg:pt-0 lg:mx-0 border-t lg:border-0 border-gray-500">
          <div className="flex gap-4">
            <button onClick={handleSubmit} className={SUBMIT_BUTTON} disabled={isPending || isUploading !== null}>
              {isPending ? 'Submitting...' : 'Submit'}
            </button>
            <button onClick={onCancel} className={CANCEL_BUTTON} disabled={isPending || isUploading !== null}>
              Cancel
            </button>
          </div>
          {!isNew && onDelete && (
            <button onClick={onDelete} className={DELETE_BUTTON} disabled={isPending || isUploading !== null}>
              Delete
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
