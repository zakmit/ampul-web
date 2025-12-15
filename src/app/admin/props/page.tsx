'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import LanguageSelector, { type Locale } from '@/components/ui/LanguageSelector';

// Style
const INPUT_STYLE = "w-full text-sm px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder:italic";
const SUBMIT_BUTTON = "max-w-30 bg-gray-900 text-white px-3 py-2 text-base hover:bg-gray-700 transition-colors";
const CANCEL_BUTTON = "max-w-30 bg-white text-gray-900 px-3 py-2 text-base border border-gray-900 hover:bg-gray-300 transition-colors";
const DELETE_BUTTON = "max-w-30 bg-red-700 text-red-100 px-3 py-2 text-base border border-red-900 hover:bg-red-900 transition-colors";
// Dummy data
const DUMMY_CATEGORIES = [
  {
    id: 1,
    slug: 'eau-de-toilette',
    translations: {
      'en-US': { name: 'Eau de Toilette', description: 'Fresh and light fragrances perfect for everyday wear' },
      'fr-FR': { name: 'Eau de Toilette', description: 'Parfums frais parfaits pour tous les jours' },
      'zh-TW': { name: '淡香水', description: '淡香水' },
    }
  }
];

const DUMMY_TAGS = [
  {
    id: 1,
    slug: 'fresh',
    translations: {
      'en-US': { name: 'Fresh' },
      'fr-FR': { name: 'Frais' },
      'zh-TW': { name: '清新' },
    }
  },
  {
    id: 2,
    slug: 'woody',
    translations: {
      'en-US': { name: 'Woody' },
      'fr-FR': { name: 'Bois' },
      'zh-TW': { name: '木質' },
    }
  }
];

const DUMMY_VOLUMES = [
  {
    id: 1,
    value: '50ml',
    translations: {
      'en-US': { displayName: '50 ml' },
      'fr-FR': { displayName: '50 ml' },
      'zh-TW': { displayName: '50 毫升' },
    }
  },
  {
    id: 2,
    value: '100ml',
    translations: {
      'en-US': { displayName: '100 ml' },
      'fr-FR': { displayName: '100 ml' },
      'zh-TW': { displayName: '100 毫升' },
    }
  }
];

type Category = typeof DUMMY_CATEGORIES[number];
type Tag = typeof DUMMY_TAGS[number];
type Volume = typeof DUMMY_VOLUMES[number];

type ExpandedSection = 'categories' | 'tags' | 'volumes' | null;

export default function PropertiesPage() {
  const [categories, setCategories] = useState<Category[]>(DUMMY_CATEGORIES);
  const [tags, setTags] = useState<Tag[]>(DUMMY_TAGS);
  const [volumes, setVolumes] = useState<Volume[]>(DUMMY_VOLUMES);

  const [expandedSection, setExpandedSection] = useState<ExpandedSection>('categories');

  // Requirement 3: Only one item can be edited at once across all sections
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editingTag, setEditingTag] = useState<number | null>(null);
  const [editingVolume, setEditingVolume] = useState<number | null>(null);

  // Track if we're creating a new item (use special ID 'new')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isCreatingVolume, setIsCreatingVolume] = useState(false);

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'category' | 'tag' | 'volume';
    id: number;
  } | null>(null);

  // Clear all editing states
  const clearAllEditing = () => {
    setEditingCategory(null);
    setEditingTag(null);
    setEditingVolume(null);
    setIsCreatingCategory(false);
    setIsCreatingTag(false);
    setIsCreatingVolume(false);
  };

  // Handler for setting category edit (clears others)
  const handleEditCategory = (id: number | null) => {
    clearAllEditing();
    setEditingCategory(id);
  };

  // Handler for setting tag edit (clears others)
  const handleEditTag = (id: number | null) => {
    clearAllEditing();
    setEditingTag(id);
  };

  // Handler for setting volume edit (clears others)
  const handleEditVolume = (id: number | null) => {
    clearAllEditing();
    setEditingVolume(id);
  };

  // Handler for creating new category
  const handleCreateCategory = () => {
    clearAllEditing();
    setIsCreatingCategory(true);
  };

  // Handler for creating new tag
  const handleCreateTag = () => {
    clearAllEditing();
    setIsCreatingTag(true);
  };

  // Handler for creating new volume
  const handleCreateVolume = () => {
    clearAllEditing();
    setIsCreatingVolume(true);
  };

  // Handler for submitting new category
  const handleSubmitNewCategory = (newCategory: Omit<Category, 'id'>) => {
    const maxId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) : 0;
    const categoryWithId: Category = {
      ...newCategory,
      id: maxId + 1,
    };
    setCategories([...categories, categoryWithId]);
    setIsCreatingCategory(false);
  };

  // Handler for submitting new tag
  const handleSubmitNewTag = (newTag: Omit<Tag, 'id'>) => {
    const maxId = tags.length > 0 ? Math.max(...tags.map(t => t.id)) : 0;
    const tagWithId: Tag = {
      ...newTag,
      id: maxId + 1,
    };
    setTags([...tags, tagWithId]);
    setIsCreatingTag(false);
  };

  // Handler for submitting new volume
  const handleSubmitNewVolume = (newVolume: Omit<Volume, 'id'>) => {
    const maxId = volumes.length > 0 ? Math.max(...volumes.map(v => v.id)) : 0;
    const volumeWithId: Volume = {
      ...newVolume,
      id: maxId + 1,
    };
    setVolumes([...volumes, volumeWithId]);
    setIsCreatingVolume(false);
  };

  // Handler for updating existing category
  const handleUpdateCategory = (id: number, updatedCategory: Omit<Category, 'id'>) => {
    setCategories(categories.map(c =>
      c.id === id ? { ...updatedCategory, id } : c
    ));
    setEditingCategory(null);
  };

  // Handler for updating existing tag
  const handleUpdateTag = (id: number, updatedTag: Omit<Tag, 'id'>) => {
    setTags(tags.map(t =>
      t.id === id ? { ...updatedTag, id } : t
    ));
    setEditingTag(null);
  };

  // Handler for updating existing volume
  const handleUpdateVolume = (id: number, updatedVolume: Omit<Volume, 'id'>) => {
    setVolumes(volumes.map(v =>
      v.id === id ? { ...updatedVolume, id } : v
    ));
    setEditingVolume(null);
  };

  // Delete handlers
  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
    setEditingCategory(null);
    setDeleteConfirmation(null);
  };

  const handleDeleteTag = (id: number) => {
    setTags(tags.filter(t => t.id !== id));
    setEditingTag(null);
    setDeleteConfirmation(null);
  };

  const handleDeleteVolume = (id: number) => {
    setVolumes(volumes.filter(v => v.id !== id));
    setEditingVolume(null);
    setDeleteConfirmation(null);
  };

  const confirmDelete = () => {
    if (!deleteConfirmation) return;

    switch (deleteConfirmation.type) {
      case 'category':
        handleDeleteCategory(deleteConfirmation.id);
        break;
      case 'tag':
        handleDeleteTag(deleteConfirmation.id);
        break;
      case 'volume':
        handleDeleteVolume(deleteConfirmation.id);
        break;
    }
  };

  // Handle section toggle
  const handleToggleSection = (section: ExpandedSection) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      clearAllEditing();
      setExpandedSection(section);
    }
  };

  return (
    <div className="lg:min-h-screen bg-white">
      {/* Delete Confirmation Popup */}
      {deleteConfirmation && (
        <div
          className="fixed inset-0 bg-gray-800/20 z-50 backdrop-blur-sm transition-all duration-500 flex items-center justify-center"
          onClick={() => setDeleteConfirmation(null)}
        >
          <div
            className="bg-white p-8 shadow-xl max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this {deleteConfirmation.type}? This action cannot be undone.
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

      <div className="lg:grid-flow-col lg:grid lg:grid-cols-12 lg:h-screen lg:max-h-400 lg:min-h-160">
        {/* Left Panel - List */}
        {/* Requirement 5: Overflow should be scrollable */}
        <div className="lg:col-span-7 border-r border-gray-300 lg:overflow-y-auto lg:h-full">
          {/* Categories Section */}
          <CategorySection
            categories={categories}
            expanded={expandedSection === 'categories'}
            onToggleExpanded={() => handleToggleSection('categories')}
            onEdit={handleEditCategory}
            editingId={editingCategory}
            onAdd={handleCreateCategory}
            isCreating={isCreatingCategory}
            onSubmitNew={handleSubmitNewCategory}
            onCancelNew={() => setIsCreatingCategory(false)}
            onUpdate={handleUpdateCategory}
            onDelete={(id) => setDeleteConfirmation({ type: 'category', id })}
          />

          {/* Tags Section */}
          <TagSection
            tags={tags}
            expanded={expandedSection === 'tags'}
            onToggleExpanded={() => handleToggleSection('tags')}
            onEdit={handleEditTag}
            editingId={editingTag}
            onAdd={handleCreateTag}
            isCreating={isCreatingTag}
            onSubmitNew={handleSubmitNewTag}
            onCancelNew={() => setIsCreatingTag(false)}
            onUpdate={handleUpdateTag}
            onDelete={(id) => setDeleteConfirmation({ type: 'tag', id })}
          />

          {/* Volumes Section */}
          <VolumeSection
            volumes={volumes}
            expanded={expandedSection === 'volumes'}
            onToggleExpanded={() => handleToggleSection('volumes')}
            onEdit={handleEditVolume}
            editingId={editingVolume}
            onAdd={handleCreateVolume}
            isCreating={isCreatingVolume}
            onSubmitNew={handleSubmitNewVolume}
            onCancelNew={() => setIsCreatingVolume(false)}
            onUpdate={handleUpdateVolume}
            onDelete={(id) => setDeleteConfirmation({ type: 'volume', id })}
          />
        </div>

        {/* Right Panel - Edit Form (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-5 bg-gray-100 p-16 lg:overflow-y-auto lg:h-full ">
          {isCreatingCategory && (
            <CategoryEditForm
              key="new-category"
              category={null}
              onCancel={() => setIsCreatingCategory(false)}
              onSubmit={handleSubmitNewCategory}
            />
          )}
          {!isCreatingCategory && editingCategory !== null && (
            <CategoryEditForm
              key={editingCategory}
              category={categories.find(c => c.id === editingCategory)!}
              onCancel={() => setEditingCategory(null)}
              onSubmit={(updatedCategory) => handleUpdateCategory(editingCategory, updatedCategory)}
              onDelete={() => setDeleteConfirmation({ type: 'category', id: editingCategory })}
            />
          )}
          {isCreatingTag && (
            <TagEditForm
              key="new-tag"
              tag={null}
              onCancel={() => setIsCreatingTag(false)}
              onSubmit={handleSubmitNewTag}
            />
          )}
          {!isCreatingTag && editingTag !== null && (
            <TagEditForm
              key={editingTag}
              tag={tags.find(t => t.id === editingTag)!}
              onCancel={() => setEditingTag(null)}
              onSubmit={(updatedTag) => handleUpdateTag(editingTag, updatedTag)}
              onDelete={() => setDeleteConfirmation({ type: 'tag', id: editingTag })}
            />
          )}
          {isCreatingVolume && (
            <VolumeEditForm
              key="new-volume"
              volume={null}
              onCancel={() => setIsCreatingVolume(false)}
              onSubmit={handleSubmitNewVolume}
            />
          )}
          {!isCreatingVolume && editingVolume !== null && (
            <VolumeEditForm
              key={editingVolume}
              volume={volumes.find(v => v.id === editingVolume)!}
              onCancel={() => setEditingVolume(null)}
              onSubmit={(updatedVolume) => handleUpdateVolume(editingVolume, updatedVolume)}
              onDelete={() => setDeleteConfirmation({ type: 'volume', id: editingVolume })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Category Section Component
function CategorySection({
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
}) {
  return (
    <div className="border-b border-gray-500 lg:mx-6 lg:mt-2 lg:mb-0">
      <button
        onClick={onToggleExpanded}
        className={`w-full flex items-center justify-between p-6 lg:px-2 hover:bg-gray-50 bg-white ${
          expanded ? 'lg:sticky lg:z-10' : ''
        }`}
      >
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-3xl font-bold lg:text-4xl">Categories</h2>
          {/* Requirement 4: Count below title, hidden on desktop */}
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
function TagSection({
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
}) {
  return (
    <div className="border-b border-gray-500 lg:mx-6">
      <button
        onClick={onToggleExpanded}
        className={`w-full flex items-center justify-between p-6 lg:px-2 hover:bg-gray-50 bg-white ${
          expanded ? 'lg:sticky lg:z-10' : ''
        }`}
      >
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-3xl font-bold lg:text-4xl">Tags</h2>
          {/* Requirement 4: Count below title, hidden on desktop */}
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
function VolumeSection({
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
}) {
  return (
    <div className="border-b border-gray-500 lg:mx-6">
      {/* Requirement 2: Sticky header using CSS sticky positioning */}
      <button
        onClick={onToggleExpanded}
        className={`w-full flex items-center justify-between p-6 lg:px-2 hover:bg-gray-50 bg-white ${
          expanded ? 'lg:sticky lg:z-10' : ''
        }`}
      >
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-3xl font-bold lg:text-4xl">Volumes</h2>
          {/* Requirement 4: Count below title, hidden on desktop */}
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
function CategoryEditForm({
  category,
  onCancel,
  onSubmit,
  onDelete,
}: {
  category: Category | null;
  onCancel: () => void;
  onSubmit: (category: Omit<Category, 'id'>) => void;
  onDelete?: () => void;
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

  const handleSubmit = () => {
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
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Address bar will be /c/name"
            className={INPUT_STYLE}
          />
        </div>

        {/* Language Selector */}
        <LanguageSelector
          value={selectedLocale}
          onChange={(locale) => {
            setSelectedLocale(locale);
          }}
        />

        {/* Localized Category Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Localized Category Name <span className="text-red-600">*</span>
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
        <div>
          <label className="block text-sm font-medium mb-2">
            Description of Category <span className="text-red-600">*</span>
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
        <div className="flex justify-between gap-4 pt-4">
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

// Tag Edit Form Component
function TagEditForm({
  tag,
  onCancel,
  onSubmit,
  onDelete,
}: {
  tag: Tag | null;
  onCancel: () => void;
  onSubmit: (tag: Omit<Tag, 'id'>) => void;
  onDelete?: () => void;
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

  const handleSubmit = () => {
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
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Unique identifier"
            className={INPUT_STYLE}
          />
        </div>

        {/* Language Selector */}
        <LanguageSelector
          value={selectedLocale}
          onChange={(locale) => {
            setSelectedLocale(locale);
          }}
        />

        {/* Localized Tag Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Localized Tag Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={translations[selectedLocale].name}
            onChange={(e) => setTranslations({
              ...translations,
              [selectedLocale]: {
                name: e.target.value,
              }
            })}
            placeholder="Name appears on the site"
            className={INPUT_STYLE}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4">
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

// Volume Edit Form Component
function VolumeEditForm({
  volume,
  onCancel,
  onSubmit,
  onDelete,
}: {
  volume: Volume | null;
  onCancel: () => void;
  onSubmit: (volume: Omit<Volume, 'id'>) => void;
  onDelete?: () => void;
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

  const handleSubmit = () => {
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
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g., 50ml"
            className={INPUT_STYLE}
          />
        </div>

        {/* Language Selector */}
        <LanguageSelector
          value={selectedLocale}
          onChange={(locale) => {
            setSelectedLocale(locale);
          }}
        />

        {/* Localized Display Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Display Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={translations[selectedLocale].displayName}
            onChange={(e) => setTranslations({
              ...translations,
              [selectedLocale]: {
                displayName: e.target.value,
              }
            })}
            placeholder="Display name for this locale"
            className={INPUT_STYLE}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4">
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
