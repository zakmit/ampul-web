'use client';

import { useState, useRef } from 'react';
import { Eye, X } from 'lucide-react';
import LanguageSelector, { type Locale } from '@/components/common/LanguageSelector';
import Image from 'next/image';

// Style constants
export const INPUT_STYLE = "w-full text-sm px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic";
export const INPUT_STYLE_ERROR = "w-full text-sm px-4 py-2 bg-white border border-red-700 rounded-md focus:outline-none focus:ring-1 focus:ring-red-700 placeholder:italic";
export const SUBMIT_BUTTON = "max-w-30 bg-gray-900 text-white px-3 py-2 text-base hover:bg-gray-700 transition-colors disabled:opacity-50";
export const CANCEL_BUTTON = "max-w-30 bg-white text-gray-900 px-3 py-2 text-base border border-gray-900 hover:bg-gray-300 transition-colors disabled:opacity-50";
export const DELETE_BUTTON = "max-w-30 bg-red-700 text-red-100 px-3 py-2 text-base border border-red-900 hover:bg-red-900 transition-colors disabled:opacity-50";

// Type definition
export type Collection = {
  id: number;
  slug: string;
  coverImage1x1: string;
  coverImage16x9: string;
  translations: Record<Locale, { name: string; description: string }>;
};

// Collection Edit Form Component
export function CollectionEditForm({
  collection,
  onCancel,
  onSubmit,
  onDelete,
  onImageUpload,
  isPending,
}: {
  collection: Collection | null;
  onCancel: () => void;
  onSubmit: (collection: Omit<Collection, 'id'>) => void;
  onDelete?: () => void;
  onImageUpload: (file: File, imageType: 'desktop' | 'mobile') => Promise<string | null>;
  isPending: boolean;
}) {
  const isNew = collection === null;
  const [selectedLocale, setSelectedLocale] = useState<Locale>('en-US');
  const [slug, setSlug] = useState(collection?.slug || '');
  const [coverImage1x1, setCoverImageDesktop] = useState(collection?.coverImage1x1 || '');
  const [coverImage16x9, setCoverImageMobile] = useState(collection?.coverImage16x9 || '');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Collection['translations']>(
    collection?.translations || {
      'en-US': { name: '', description: '' },
      'fr-FR': { name: '', description: '' },
      'zh-TW': { name: '', description: '' },
    }
  );
  const [validationErrors, setValidationErrors] = useState({
    slug: false,
    name: false,
    description: false,
    coverImage1x1: false,
    coverImage16x9: false,
  });
  const [isUploading, setIsUploading] = useState<'desktop' | 'mobile' | null>(null);

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>, imageType: 'desktop' | 'mobile') => {
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
        } else {
          setCoverImageMobile(url);
          if (validationErrors.coverImage16x9) {
            setValidationErrors({ ...validationErrors, coverImage16x9: false });
          }
        }
      }
    } finally {
      setIsUploading(null);
      // Reset the input so the same file can be selected again
      event.target.value = '';
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    const errors = {
      slug: !slug.trim(),
      name: !translations['en-US'].name.trim(),
      description: !translations['en-US'].description.trim(),
      coverImage1x1: !coverImage1x1.trim(),
      coverImage16x9: !coverImage16x9.trim(),
    };

    setValidationErrors(errors);

    // If there are errors, don't submit
    if (Object.values(errors).some(e => e)) {
      return;
    }

    onSubmit({
      slug,
      coverImage1x1,
      coverImage16x9,
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
            onClick={() => !isUploading && mobileInputRef.current?.click()}
            className={`relative h-40 bg-gray-200 hover:bg-gray-500 transition-colors cursor-pointer group overflow-hidden ${
              validationErrors.coverImage16x9 ? ' bg-red-700' : ''
            }`}
          >
            {coverImage16x9 && (
              <Image
                src={coverImage16x9}
                alt="16:9 Promotional"
                fill
                className="object-cover"
              />
            )}

            {/* Overlay */}
            {coverImage16x9 && (
              <div className="absolute inset-0 bg-gray-700/20 group-hover:bg-gray-900/20 transition-colors" />
            )}

            {/* Description */}
            <div className={`absolute w-full h-full text-center content-center text-sm font-medium transition group-hover:-top-1/6 ${
              coverImage16x9 ? 'text-gray-100' : 'text-gray-900 group-hover:text-gray-700'
            }`}>
              16:9 Promotional <span className="text-red-600">*</span>
            </div>

            {/* Upload/Change Button - shows on hover */}
            <div className="absolute inset-0 flex top-1/5 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  mobileInputRef.current?.click();
                }}
                className="bg-gray-900 text-white px-6 py-2 text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={isUploading !== null}
              >
                {isUploading === 'mobile' ? 'Uploading...' : (coverImage16x9 ? 'Change' : 'Upload')}
              </button>
            </div>
          </div>
          <input
            ref={mobileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleImageSelect(e, 'mobile')}
            className="hidden"
          />
        </div>

        {/* 1:1 Promotional Image */}
        <div className="w-40">
          <div
            onClick={() => !isUploading && desktopInputRef.current?.click()}
            className={`relative h-40 bg-gray-200 hover:bg-gray-500 transition-colors cursor-pointer group overflow-hidden ${
              validationErrors.coverImage1x1 ? ' bg-red-700' : ''
            }`}
          >
            {coverImage1x1 && (
              <Image
                src={coverImage1x1}
                alt="1:1 Promotional"
                fill
                className="object-cover"
              />
            )}

            {/* Overlay */}
            {coverImage1x1 && (
              <div className="absolute inset-0 bg-gray-700/20 group-hover:bg-gray-900/20 transition-colors" />
            )}

            {/* Description */}
            <div className={`absolute w-full h-full text-center content-center text-sm font-medium transition group-hover:-top-1/6 ${
              coverImage1x1 ? 'text-gray-100' : 'text-gray-900 group-hover:text-gray-700'
            }`}>
              1:1 Promotional <span className="text-red-600">*</span>
            </div>

            {/* Upload/Change Button - shows on hover */}
            <div className="absolute inset-0 flex top-1/5 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  desktopInputRef.current?.click();
                }}
                className="bg-gray-900 text-white px-6 py-2 text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={isUploading !== null}
              >
                {isUploading === 'desktop' ? 'Uploading...' : (coverImage1x1 ? 'Change' : 'Upload')}
              </button>
            </div>
          </div>
          <input
            ref={desktopInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleImageSelect(e, 'desktop')}
            className="hidden"
          />
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
            onChange={(e) => {
              setSlug(e.target.value);
              if (validationErrors.slug) {
                setValidationErrors({ ...validationErrors, slug: false });
              }
            }}
            placeholder="Address bar will be /c/name"
            className={validationErrors.slug ? INPUT_STYLE_ERROR : INPUT_STYLE}
            disabled={isPending || isUploading !== null}
          />
        </div>

        {/* Images Section (Mobile/Tablet) */}
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
                  type="button"
                  onClick={() => coverImage16x9 && setPreviewImage(coverImage16x9)}
                  className={`${coverImage16x9 ? 'text-gray-900' : 'text-gray-500'} hover:opacity-70 transition-opacity`}
                  disabled={!coverImage16x9}
                >
                  <Eye className="w-6 h-6" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => mobileInputRef.current?.click()}
                className={`w-20 py-2 text-sm disabled:opacity-50 ${
                  validationErrors.coverImage16x9
                    ? 'bg-red-700 text-red-100 border border-red-900 hover:bg-red-900 transition-colors'
                    : coverImage16x9
                      ? 'bg-gray-900 text-white hover:opacity-80 transition-opacity'
                      : 'bg-gray-500 text-white hover:opacity-80 transition-opacity'
                }`}
                disabled={isUploading !== null}
              >
                {isUploading === 'mobile' ? 'Wait...' : validationErrors.coverImage16x9 ? 'Required' : (coverImage16x9 ? 'Change' : 'Upload')}
              </button>
            </div>
            <input
              ref={mobileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleImageSelect(e, 'mobile')}
              className="hidden"
            />
          </div>

          {/* 1:1 Promotional */}
          <div className="ml-4">
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center">
                <label className="text-sm w-32">
                  1:1 Promotional <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => coverImage1x1 && setPreviewImage(coverImage1x1)}
                  className={`${coverImage1x1 ? 'text-gray-900' : 'text-gray-500'} hover:opacity-70 transition-opacity`}
                  disabled={!coverImage1x1}
                >
                  <Eye className="w-6 h-6" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => desktopInputRef.current?.click()}
                className={`w-20 py-2 text-sm disabled:opacity-50 ${
                  validationErrors.coverImage1x1
                    ? 'bg-red-700 text-red-100 border border-red-900 hover:bg-red-900 transition-colors'
                    : coverImage1x1
                      ? 'bg-gray-900 text-white hover:opacity-80 transition-opacity'
                      : 'bg-gray-500 text-white hover:opacity-80 transition-opacity'
                }`}
                disabled={isUploading !== null}
              >
                {isUploading === 'desktop' ? 'Wait...' : validationErrors.coverImage1x1 ? 'Required' : (coverImage1x1 ? 'Change' : 'Upload')}
              </button>
            </div>
            <input
              ref={desktopInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleImageSelect(e, 'desktop')}
              className="hidden"
            />
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
            <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
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
        <div className="border-b border-gray-900 -mx-6 lg:-mx-22 xl:-mx-28 text-center">
          <LanguageSelector
            value={selectedLocale}
            onChange={(locale) => {
              setSelectedLocale(locale);
            }}
          />
        </div>

        {/* Localized Collection Name */}
        <div className="mx-6 lg:mx-0">
          <label className="block text-sm font-medium mb-2">
            Localized Collection Name {selectedLocale === 'en-US' && <span className="text-red-600">*</span>}
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

        {/* Description */}
        <div className="mx-6 lg:mx-0">
          <label className="block text-sm font-medium mb-2">
            Description of collection {selectedLocale === 'en-US' && <span className="text-red-600">*</span>}
          </label>
          <textarea
            value={translations[selectedLocale].description}
            onChange={(e) => {
              setTranslations({
                ...translations,
                [selectedLocale]: {
                  ...translations[selectedLocale],
                  description: e.target.value,
                }
              });
              if (selectedLocale === 'en-US' && validationErrors.description) {
                setValidationErrors({ ...validationErrors, description: false });
              }
            }}
            placeholder="Description appears below the product"
            rows={4}
            className={selectedLocale === 'en-US' && validationErrors.description ? INPUT_STYLE_ERROR : INPUT_STYLE}
            disabled={isPending || isUploading !== null}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4 px-6 lg:pt-0 lg:mx-0 border-t lg:border-0 border-gray-500">
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className={SUBMIT_BUTTON}
              disabled={isPending || isUploading !== null}
            >
              {isPending ? 'Submitting...' : 'Submit'}
            </button>
            <button
              onClick={onCancel}
              className={CANCEL_BUTTON}
              disabled={isPending || isUploading !== null}
            >
              Cancel
            </button>
          </div>
          {!isNew && onDelete && (
            <button
              onClick={onDelete}
              className={DELETE_BUTTON}
              disabled={isPending || isUploading !== null}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
