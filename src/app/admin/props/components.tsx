'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import LanguageSelector, { type Locale } from '@/components/common/LanguageSelector';

// Style constants
export const INPUT_STYLE = "w-full text-sm px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic";
export const INPUT_STYLE_ERROR = "w-full text-sm px-4 py-2 bg-white border border-red-700 rounded-md focus:outline-none focus:ring-1 focus:ring-red-700 placeholder:italic";
export const SUBMIT_BUTTON = "max-w-30 bg-gray-900 text-white px-3 py-2 text-base hover:bg-gray-700 transition-colors disabled:opacity-50";
export const CANCEL_BUTTON = "max-w-30 bg-white text-gray-900 px-3 py-2 text-base border border-gray-900 hover:bg-gray-300 transition-colors disabled:opacity-50";
export const DELETE_BUTTON = "max-w-30 bg-red-700 text-red-100 px-3 py-2 text-base border border-red-900 hover:bg-red-900 transition-colors disabled:opacity-50";

// Type definitions
export type Category = {
  id: number;
  slug: string;
  translations: Record<Locale, { name: string; description: string }>;
};

export type Tag = {
  id: number;
  slug: string;
  translations: Record<Locale, { name: string }>;
};

export type Volume = {
  id: number;
  value: string;
  translations: Record<Locale, { displayName: string }>;
};

// Category Section Component
export function CategorySection({
  categories,
  expanded,
  onToggleExpanded,
  onEdit,
  editingId,
  onAdd,
  isCreating,
  onSubmitNew,
  onCancelNew,
  onUpdate,
  onDelete,
  isPending,
}: {
  categories: Category[];
  expanded: boolean;
  onToggleExpanded: () => void;
  onEdit: (id: number | null) => void;
  editingId: number | null;
  onAdd: () => void;
  isCreating: boolean;
  onSubmitNew: (newCategory: Omit<Category, 'id'>) => void;
  onCancelNew: () => void;
  onUpdate: (id: number, updatedCategory: Omit<Category, 'id'>) => void;
  onDelete: (id: number) => void;
  isPending: boolean;
}) {
  return (
    <div className="border-b border-gray-500 lg:mx-6 lg:mt-2 lg:mb-0">
      <button
        onClick={onToggleExpanded}
        className={`w-full flex items-center justify-between p-6 lg:px-2 hover:bg-gray-100 bg-white ${
          expanded ? 'lg:sticky lg:z-10' : ''
        }`}
      >
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-3xl font-bold lg:text-4xl">Categories</h2>
          <span className="hidden lg:flex text-sm">
            {categories.length > 1 ? `${categories.length} categories` : `${categories.length} category`}
          </span>
        </div>
        <ChevronDown className={`w-6 h-6 transition-transform ${expanded ? '' : '-rotate-90'}`} />
      </button>

      {expanded && (
        <div className="border-t border-gray-500">
          <div className="mx-4 mb-4 lg:mb-10">
            {/* Mobile */}
            <div className="flex lg:hidden px-2 py-4 items-center justify-between text-sm">
              {categories.length > 1 ? (<span>{categories.length} categories</span>) : (<span>{categories.length} category</span>)}
              <button onClick={onAdd} className="hover:text-gray-600">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop */}
            <div className="hidden lg:flex -mx-4 py-4 items-center justify-end text-sm">
              <button onClick={onAdd} className="hover:text-gray-600">
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col gap-4 lg:gap-6">
              {/* New Category Form */}
              {isCreating && (
                <div>
                  <button
                    className="w-full px-6 py-6 flex items-center justify-between bg-gray-700 text-white"
                  >
                    <span className="text-2xl font-title">New Category</span>
                    <ChevronRight className="w-6 h-6 rotate-90" />
                  </button>

                  {/* Mobile Edit Form for New Category */}
                  <div className="lg:hidden bg-gray-100 p-6">
                    <CategoryEditForm
                      category={null}
                      onCancel={onCancelNew}
                      onSubmit={onSubmitNew}
                      isPending={isPending}
                    />
                  </div>
                </div>
              )}

              {categories.map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() => {
                      if (editingId === category.id) {
                        onEdit(null);
                      } else {
                        onEdit(category.id);
                      }
                    }}
                    className={`w-full px-6 py-6 flex items-center justify-between ${
                      editingId === category.id ? 'bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    <span className="text-2xl font-title">{category.translations['en-US'].name}</span>
                    <ChevronRight className={`w-6 h-6 transition-transform ${editingId === category.id ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Mobile Edit Form */}
                  {editingId === category.id && (
                    <div className="lg:hidden bg-gray-100 p-6">
                      <CategoryEditForm
                        category={category}
                        onCancel={() => onEdit(null)}
                        onSubmit={(updatedCategory) => onUpdate(category.id, updatedCategory)}
                        onDelete={() => onDelete(category.id)}
                        isPending={isPending}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tag Section Component
export function TagSection({
  tags,
  expanded,
  onToggleExpanded,
  onEdit,
  editingId,
  onAdd,
  isCreating,
  onSubmitNew,
  onCancelNew,
  onUpdate,
  onDelete,
  isPending,
}: {
  tags: Tag[];
  expanded: boolean;
  onToggleExpanded: () => void;
  onEdit: (id: number | null) => void;
  editingId: number | null;
  onAdd: () => void;
  isCreating: boolean;
  onSubmitNew: (newTag: Omit<Tag, 'id'>) => void;
  onCancelNew: () => void;
  onUpdate: (id: number, updatedTag: Omit<Tag, 'id'>) => void;
  onDelete: (id: number) => void;
  isPending: boolean;
}) {
  return (
    <div className="border-b border-gray-500 lg:mx-6">
      <button
        onClick={onToggleExpanded}
        className={`w-full flex items-center justify-between p-6 lg:px-2 hover:bg-gray-100 bg-white ${
          expanded ? 'lg:sticky lg:z-10' : ''
        }`}
      >
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-3xl font-bold lg:text-4xl">Tags</h2>
          <span className="hidden lg:flex text-sm">
            {tags.length > 1 ? `${tags.length} tags` : `${tags.length} tag`}
          </span>
        </div>
        <ChevronRight className={`w-6 h-6 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-gray-500">
          <div className="mx-4 mb-4 lg:mb-10">
            {/* Mobile */}
            <div className="flex lg:hidden px-2 py-4 items-center justify-between text-sm">
              {tags.length > 1 ? (<span>{tags.length} tags</span>) : (<span>{tags.length} tag</span>)}
              <button onClick={onAdd} className="hover:text-gray-600">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop */}
            <div className="hidden lg:flex -mx-4 py-4 items-center justify-end text-sm">
              <button onClick={onAdd} className="hover:text-gray-600">
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col gap-4 lg:gap-6">
              {/* New Tag Form */}
              {isCreating && (
                <div>
                  <button
                    className="w-full px-6 py-6 flex items-center justify-between bg-gray-700 text-white"
                  >
                    <span className="text-2xl font-title">New Tag</span>
                    <ChevronRight className="w-6 h-6 rotate-90" />
                  </button>

                  {/* Mobile Edit Form for New Tag */}
                  <div className="lg:hidden bg-gray-100 p-6">
                    <TagEditForm
                      tag={null}
                      onCancel={onCancelNew}
                      onSubmit={onSubmitNew}
                      isPending={isPending}
                    />
                  </div>
                </div>
              )}

              {tags.map((tag) => (
                <div key={tag.id}>
                  <button
                    onClick={() => {
                      if (editingId === tag.id) {
                        onEdit(null);
                      } else {
                        onEdit(tag.id);
                      }
                    }}
                    className={`w-full px-6 py-6 flex items-center justify-between ${
                      editingId === tag.id ? 'bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    <span className="text-2xl font-title">{tag.translations['en-US'].name}</span>
                    <ChevronRight className={`w-6 h-6 transition-transform ${editingId === tag.id ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Mobile Edit Form */}
                  {editingId === tag.id && (
                    <div className="lg:hidden bg-gray-100 p-6">
                      <TagEditForm
                        tag={tag}
                        onCancel={() => onEdit(null)}
                        onSubmit={(updatedTag) => onUpdate(tag.id, updatedTag)}
                        onDelete={() => onDelete(tag.id)}
                        isPending={isPending}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Volume Section Component
export function VolumeSection({
  volumes,
  expanded,
  onToggleExpanded,
  onEdit,
  editingId,
  onAdd,
  isCreating,
  onSubmitNew,
  onCancelNew,
  onUpdate,
  onDelete,
  isPending,
}: {
  volumes: Volume[];
  expanded: boolean;
  onToggleExpanded: () => void;
  onEdit: (id: number | null) => void;
  editingId: number | null;
  onAdd: () => void;
  isCreating: boolean;
  onSubmitNew: (newVolume: Omit<Volume, 'id'>) => void;
  onCancelNew: () => void;
  onUpdate: (id: number, updatedVolume: Omit<Volume, 'id'>) => void;
  onDelete: (id: number) => void;
  isPending: boolean;
}) {
  return (
    <div className="border-b border-gray-500 lg:mx-6">
      <button
        onClick={onToggleExpanded}
        className={`w-full flex items-center justify-between p-6 lg:px-2 hover:bg-gray-100 bg-white ${
          expanded ? 'lg:sticky lg:z-10' : ''
        }`}
      >
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-3xl font-bold lg:text-4xl">Volumes</h2>
          <span className="hidden lg:flex text-sm">
            {volumes.length > 1 ? `${volumes.length} volumes` : `${volumes.length} volume`}
          </span>
        </div>
        <ChevronRight className={`w-6 h-6 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-gray-500">
          <div className="mx-4 mb-4 lg:mb-10">
            {/* Mobile */}
            <div className="flex lg:hidden px-2 py-4 items-center justify-between text-sm">
              {volumes.length > 1 ? (<span>{volumes.length} volumes</span>) : (<span>{volumes.length} volume</span>)}
              <button onClick={onAdd} className="hover:text-gray-600">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop */}
            <div className="hidden lg:flex -mx-4 py-4 items-center justify-end text-sm">
              <button onClick={onAdd} className="hover:text-gray-600">
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col gap-4 lg:gap-6">
              {/* New Volume Form */}
              {isCreating && (
                <div>
                  <button
                    className="w-full px-6 py-6 flex items-center justify-between bg-gray-700 text-white"
                  >
                    <span className="text-2xl font-title">New Volume</span>
                    <ChevronRight className="w-6 h-6 rotate-90" />
                  </button>

                  {/* Mobile Edit Form for New Volume */}
                  <div className="lg:hidden bg-gray-100 p-6">
                    <VolumeEditForm
                      volume={null}
                      onCancel={onCancelNew}
                      onSubmit={onSubmitNew}
                      isPending={isPending}
                    />
                  </div>
                </div>
              )}

              {volumes.map((volume) => (
                <div key={volume.id}>
                  <button
                    onClick={() => {
                      if (editingId === volume.id) {
                        onEdit(null);
                      } else {
                        onEdit(volume.id);
                      }
                    }}
                    className={`w-full px-6 py-6 flex items-center justify-between ${
                      editingId === volume.id ? 'bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    <span className="text-2xl font-title">{volume.translations['en-US'].displayName}</span>
                    <ChevronRight className={`w-6 h-6 transition-transform ${editingId === volume.id ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Mobile Edit Form */}
                  {editingId === volume.id && (
                    <div className="lg:hidden bg-gray-100 p-6">
                      <VolumeEditForm
                        volume={volume}
                        onCancel={() => onEdit(null)}
                        onSubmit={(updatedVolume) => onUpdate(volume.id, updatedVolume)}
                        onDelete={() => onDelete(volume.id)}
                        isPending={isPending}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Category Edit Form Component
export function CategoryEditForm({
  category,
  onCancel,
  onSubmit,
  onDelete,
  isPending,
}: {
  category: Category | null;
  onCancel: () => void;
  onSubmit: (category: Omit<Category, 'id'>) => void;
  onDelete?: () => void;
  isPending: boolean;
}) {
  const isNew = category === null;
  const [selectedLocale, setSelectedLocale] = useState<Locale>('en-US');
  const [slug, setSlug] = useState(category?.slug || '');
  const [translations, setTranslations] = useState<Category['translations']>(
    category?.translations || {
      'en-US': { name: '', description: '' },
      'fr-FR': { name: '', description: '' },
      'zh-TW': { name: '', description: '' },
    }
  );
  const [validationErrors, setValidationErrors] = useState({
    slug: false,
    name: false,
    description: false,
  });

  const handleSubmit = () => {
    // Validate required fields (slug and en-US translations)
    const errors = {
      slug: !slug.trim(),
      name: !translations['en-US'].name.trim(),
      description: !translations['en-US'].description.trim(),
    };

    setValidationErrors(errors);

    // If there are errors, don't submit
    if (errors.slug || errors.name || errors.description) {
      return;
    }

    onSubmit({
      slug,
      translations,
    });
  };

  return (
    <div>
      <h3 className="hidden lg:block lg:text-4xl font-bold mb-12">
        {isNew ? 'New Category' : 'Edit Category'}
      </h3>

      <div className="space-y-6 lg:px-6 xl:px-12">
        {/* Category Unique Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Category Unique Name <span className="text-red-600">*</span>
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
            disabled={isPending}
          />
        </div>

        {/* Language Selector */}
        <div className="border-b border-gray-900 -mx-6 lg:-mx-22 xl:-mx-28 text-center">
          <LanguageSelector
            value={selectedLocale}
            onChange={(locale) => {
              setSelectedLocale(locale);
            }}
          />
        </div>

        {/* Localized Category Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Localized Category Name {selectedLocale === 'en-US' && <span className="text-red-600">*</span>}
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
            disabled={isPending}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description of Category {selectedLocale === 'en-US' && <span className="text-red-600">*</span>}
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
            disabled={isPending}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4">
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className={SUBMIT_BUTTON}
              disabled={isPending}
            >
              {isPending ? 'Submitting...' : 'Submit'}
            </button>
            <button
              onClick={onCancel}
              className={CANCEL_BUTTON}
              disabled={isPending}
            >
              Cancel
            </button>
          </div>
          {!isNew && onDelete && (
            <button
              onClick={onDelete}
              className={DELETE_BUTTON}
              disabled={isPending}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Tag Edit Form Component
export function TagEditForm({
  tag,
  onCancel,
  onSubmit,
  onDelete,
  isPending,
}: {
  tag: Tag | null;
  onCancel: () => void;
  onSubmit: (tag: Omit<Tag, 'id'>) => void;
  onDelete?: () => void;
  isPending: boolean;
}) {
  const isNew = tag === null;
  const [selectedLocale, setSelectedLocale] = useState<Locale>('en-US');
  const [slug, setSlug] = useState(tag?.slug || '');
  const [translations, setTranslations] = useState<Tag['translations']>(
    tag?.translations || {
      'en-US': { name: '' },
      'fr-FR': { name: '' },
      'zh-TW': { name: '' },
    }
  );
  const [validationErrors, setValidationErrors] = useState({
    slug: false,
    name: false,
  });

  const handleSubmit = () => {
    // Validate required fields (slug and en-US translation)
    const errors = {
      slug: !slug.trim(),
      name: !translations['en-US'].name.trim(),
    };

    setValidationErrors(errors);

    // If there are errors, don't submit
    if (errors.slug || errors.name) {
      return;
    }

    onSubmit({
      slug,
      translations,
    });
  };

  return (
    <div>
      <h3 className="hidden lg:block lg:text-4xl font-bold mb-12">
        {isNew ? 'New Tag' : 'Edit Tag'}
      </h3>

      <div className="space-y-6 lg:space-y-10 lg:px-6 xl:px-12">
        {/* Tag Unique Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tag Unique Name <span className="text-red-600">*</span>
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
            placeholder="Unique identifier"
            className={validationErrors.slug ? INPUT_STYLE_ERROR : INPUT_STYLE}
            disabled={isPending}
          />
        </div>

        {/* Language Selector */}
        <div className="border-b border-gray-900 -mx-6 lg:-mx-22 xl:-mx-28 text-center">
          <LanguageSelector
            value={selectedLocale}
            onChange={(locale) => {
              setSelectedLocale(locale);
            }}
          />
        </div>

        {/* Localized Tag Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Localized Tag Name {selectedLocale === 'en-US' && <span className="text-red-600">*</span>}
          </label>
          <input
            type="text"
            value={translations[selectedLocale].name}
            onChange={(e) => {
              setTranslations({
                ...translations,
                [selectedLocale]: {
                  name: e.target.value,
                }
              });
              if (selectedLocale === 'en-US' && validationErrors.name) {
                setValidationErrors({ ...validationErrors, name: false });
              }
            }}
            placeholder="Name appears on the site"
            className={selectedLocale === 'en-US' && validationErrors.name ? INPUT_STYLE_ERROR : INPUT_STYLE}
            disabled={isPending}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4">
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className={SUBMIT_BUTTON}
              disabled={isPending}
            >
              {isPending ? 'Submitting...' : 'Submit'}
            </button>
            <button
              onClick={onCancel}
              className={CANCEL_BUTTON}
              disabled={isPending}
            >
              Cancel
            </button>
          </div>
          {!isNew && onDelete && (
            <button
              onClick={onDelete}
              className={DELETE_BUTTON}
              disabled={isPending}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Volume Edit Form Component
export function VolumeEditForm({
  volume,
  onCancel,
  onSubmit,
  onDelete,
  isPending,
}: {
  volume: Volume | null;
  onCancel: () => void;
  onSubmit: (volume: Omit<Volume, 'id'>) => void;
  onDelete?: () => void;
  isPending: boolean;
}) {
  const isNew = volume === null;
  const [selectedLocale, setSelectedLocale] = useState<Locale>('en-US');
  const [value, setValue] = useState(volume?.value || '');
  const [translations, setTranslations] = useState<Volume['translations']>(
    volume?.translations || {
      'en-US': { displayName: '' },
      'fr-FR': { displayName: '' },
      'zh-TW': { displayName: '' },
    }
  );
  const [validationErrors, setValidationErrors] = useState({
    value: false,
    displayName: false,
  });

  const handleSubmit = () => {
    // Validate required fields (value and en-US translation)
    const errors = {
      value: !value.trim(),
      displayName: !translations['en-US'].displayName.trim(),
    };

    setValidationErrors(errors);

    // If there are errors, don't submit
    if (errors.value || errors.displayName) {
      return;
    }

    onSubmit({
      value,
      translations,
    });
  };

  return (
    <div>
      <h3 className="hidden lg:block lg:text-4xl font-bold mb-12">
        {isNew ? 'New Volume' : 'Edit Volume'}
      </h3>

      <div className="space-y-6 lg:space-y-10 lg:px-6 xl:px-12">
        {/* Volume Value */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Volume Value <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (validationErrors.value) {
                setValidationErrors({ ...validationErrors, value: false });
              }
            }}
            placeholder="e.g., 50ml"
            className={validationErrors.value ? INPUT_STYLE_ERROR : INPUT_STYLE}
            disabled={isPending}
          />
        </div>

        {/* Language Selector */}
        <div className="border-b border-gray-900 -mx-6 lg:-mx-22 xl:-mx-28 text-center">
          <LanguageSelector
            value={selectedLocale}
            onChange={(locale) => {
              setSelectedLocale(locale);
            }}
          />
        </div>

        {/* Localized Display Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Display Name {selectedLocale === 'en-US' && <span className="text-red-600">*</span>}
          </label>
          <input
            type="text"
            value={translations[selectedLocale].displayName}
            onChange={(e) => {
              setTranslations({
                ...translations,
                [selectedLocale]: {
                  displayName: e.target.value,
                }
              });
              if (selectedLocale === 'en-US' && validationErrors.displayName) {
                setValidationErrors({ ...validationErrors, displayName: false });
              }
            }}
            placeholder="Display name for this locale"
            className={selectedLocale === 'en-US' && validationErrors.displayName ? INPUT_STYLE_ERROR : INPUT_STYLE}
            disabled={isPending}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4">
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className={SUBMIT_BUTTON}
              disabled={isPending}
            >
              {isPending ? 'Submitting...' : 'Submit'}
            </button>
            <button
              onClick={onCancel}
              className={CANCEL_BUTTON}
              disabled={isPending}
            >
              Cancel
            </button>
          </div>
          {!isNew && onDelete && (
            <button
              onClick={onDelete}
              className={DELETE_BUTTON}
              disabled={isPending}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
