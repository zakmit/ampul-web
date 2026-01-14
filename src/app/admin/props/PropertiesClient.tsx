'use client';

import { useState, useTransition } from 'react';
import type { Locale } from '@/components/ui/LanguageSelector';
import type { CategoryWithTranslations, TagWithTranslations, VolumeWithTranslations } from './data';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createTag,
  updateTag,
  deleteTag,
  createVolume,
  updateVolume,
  deleteVolume,
} from './actions';
import {
  CategorySection,
  TagSection,
  VolumeSection,
  CategoryEditForm,
  TagEditForm,
  VolumeEditForm,
  CANCEL_BUTTON,
  DELETE_BUTTON,
  type Category,
  type Tag,
  type Volume,
} from './components';

type ExpandedSection = 'categories' | 'tags' | 'volumes' | null;

// Transform Prisma data to UI format
function transformCategories(categories: CategoryWithTranslations[]): Category[] {
  return categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    translations: cat.translations.reduce((acc, t) => {
      acc[t.locale as Locale] = { name: t.name, description: t.description };
      return acc;
    }, {} as Record<Locale, { name: string; description: string }>),
  }));
}

function transformTags(tags: TagWithTranslations[]): Tag[] {
  return tags.map((tag) => ({
    id: tag.id,
    slug: tag.slug,
    translations: tag.translations.reduce((acc, t) => {
      acc[t.locale as Locale] = { name: t.name };
      return acc;
    }, {} as Record<Locale, { name: string }>),
  }));
}

function transformVolumes(volumes: VolumeWithTranslations[]): Volume[] {
  return volumes.map((vol) => ({
    id: vol.id,
    value: vol.value,
    translations: vol.translations.reduce((acc, t) => {
      acc[t.locale as Locale] = { displayName: t.displayName };
      return acc;
    }, {} as Record<Locale, { displayName: string }>),
  }));
}

export default function PropertiesClient({
  initialCategories,
  initialTags,
  initialVolumes,
}: {
  initialCategories: CategoryWithTranslations[]
  initialTags: TagWithTranslations[]
  initialVolumes: VolumeWithTranslations[]
}) {
  const [categories, setCategories] = useState(transformCategories(initialCategories));
  const [tags, setTags] = useState(transformTags(initialTags));
  const [volumes, setVolumes] = useState(transformVolumes(initialVolumes));
  const [isPending, startTransition] = useTransition();

  const [expandedSection, setExpandedSection] = useState<ExpandedSection>('categories');

  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editingTag, setEditingTag] = useState<number | null>(null);
  const [editingVolume, setEditingVolume] = useState<number | null>(null);

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isCreatingVolume, setIsCreatingVolume] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'category' | 'tag' | 'volume';
    id: number;
  } | null>(null);

  const clearAllEditing = () => {
    setEditingCategory(null);
    setEditingTag(null);
    setEditingVolume(null);
    setIsCreatingCategory(false);
    setIsCreatingTag(false);
    setIsCreatingVolume(false);
  };

  const handleEditCategory = (id: number | null) => {
    clearAllEditing();
    setEditingCategory(id);
  };

  const handleEditTag = (id: number | null) => {
    clearAllEditing();
    setEditingTag(id);
  };

  const handleEditVolume = (id: number | null) => {
    clearAllEditing();
    setEditingVolume(id);
  };

  const handleCreateCategory = () => {
    clearAllEditing();
    setIsCreatingCategory(true);
  };

  const handleCreateTag = () => {
    clearAllEditing();
    setIsCreatingTag(true);
  };

  const handleCreateVolume = () => {
    clearAllEditing();
    setIsCreatingVolume(true);
  };

  // Category handlers
  const handleSubmitNewCategory = async (newCategory: Omit<Category, 'id'>) => {
    startTransition(async () => {
      const translations = Object.entries(newCategory.translations).map(([locale, data]) => ({
        locale,
        name: data.name,
        description: data.description,
      }));

      const result = await createCategory({ slug: newCategory.slug, translations });

      if (result.success && result.data) {
        const transformed = transformCategories([result.data]);
        setCategories([...categories, ...transformed]);
        setIsCreatingCategory(false);
      } else {
        alert(result.error || 'Failed to create category');
      }
    });
  };

  const handleUpdateCategory = async (id: number, updatedCategory: Omit<Category, 'id'>) => {
    startTransition(async () => {
      const translations = Object.entries(updatedCategory.translations).map(([locale, data]) => ({
        locale,
        name: data.name,
        description: data.description,
      }));

      const result = await updateCategory(id, { slug: updatedCategory.slug, translations });

      if (result.success && result.data) {
        const transformed = transformCategories([result.data]);
        setCategories(categories.map((c) => (c.id === id ? transformed[0] : c)));
        setEditingCategory(null);
      } else {
        alert(result.error || 'Failed to update category');
      }
    });
  };

  const handleDeleteCategory = async (id: number) => {
    startTransition(async () => {
      const result = await deleteCategory(id);

      if (result.success) {
        setCategories(categories.filter((c) => c.id !== id));
        setEditingCategory(null);
        setDeleteConfirmation(null);
      } else {
        alert(result.error || 'Failed to delete category');
      }
    });
  };

  // Tag handlers
  const handleSubmitNewTag = async (newTag: Omit<Tag, 'id'>) => {
    startTransition(async () => {
      const translations = Object.entries(newTag.translations).map(([locale, data]) => ({
        locale,
        name: data.name,
      }));

      const result = await createTag({ slug: newTag.slug, translations });

      if (result.success && result.data) {
        const transformed = transformTags([result.data]);
        setTags([...tags, ...transformed]);
        setIsCreatingTag(false);
      } else {
        alert(result.error || 'Failed to create tag');
      }
    });
  };

  const handleUpdateTag = async (id: number, updatedTag: Omit<Tag, 'id'>) => {
    startTransition(async () => {
      const translations = Object.entries(updatedTag.translations).map(([locale, data]) => ({
        locale,
        name: data.name,
      }));

      const result = await updateTag(id, { slug: updatedTag.slug, translations });

      if (result.success && result.data) {
        const transformed = transformTags([result.data]);
        setTags(tags.map((t) => (t.id === id ? transformed[0] : t)));
        setEditingTag(null);
      } else {
        alert(result.error || 'Failed to update tag');
      }
    });
  };

  const handleDeleteTag = async (id: number) => {
    startTransition(async () => {
      const result = await deleteTag(id);

      if (result.success) {
        setTags(tags.filter((t) => t.id !== id));
        setEditingTag(null);
        setDeleteConfirmation(null);
      } else {
        alert(result.error || 'Failed to delete tag');
      }
    });
  };

  // Volume handlers
  const handleSubmitNewVolume = async (newVolume: Omit<Volume, 'id'>) => {
    startTransition(async () => {
      const translations = Object.entries(newVolume.translations).map(([locale, data]) => ({
        locale,
        displayName: data.displayName,
      }));

      const result = await createVolume({ value: newVolume.value, translations });

      if (result.success && result.data) {
        const transformed = transformVolumes([result.data]);
        setVolumes([...volumes, ...transformed]);
        setIsCreatingVolume(false);
      } else {
        alert(result.error || 'Failed to create volume');
      }
    });
  };

  const handleUpdateVolume = async (id: number, updatedVolume: Omit<Volume, 'id'>) => {
    startTransition(async () => {
      const translations = Object.entries(updatedVolume.translations).map(([locale, data]) => ({
        locale,
        displayName: data.displayName,
      }));

      const result = await updateVolume(id, { value: updatedVolume.value, translations });

      if (result.success && result.data) {
        const transformed = transformVolumes([result.data]);
        setVolumes(volumes.map((v) => (v.id === id ? transformed[0] : v)));
        setEditingVolume(null);
      } else {
        alert(result.error || 'Failed to update volume');
      }
    });
  };

  const handleDeleteVolume = async (id: number) => {
    startTransition(async () => {
      const result = await deleteVolume(id);

      if (result.success) {
        setVolumes(volumes.filter((v) => v.id !== id));
        setEditingVolume(null);
        setDeleteConfirmation(null);
      } else {
        alert(result.error || 'Failed to delete volume');
      }
    });
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

  const handleToggleSection = (section: ExpandedSection) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      clearAllEditing();
      setExpandedSection(section);
    }
  };

  return (
    <div className="lg:min-h-screen w-full bg-white">
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

      <div className="min-h-dvh lg:grid-flow-col lg:grid lg:grid-cols-12 lg:h-screen lg:max-h-400 lg:min-h-160">
        {/* Left Panel - List */}
        <div className="lg:col-span-7 border-r border-gray-300 lg:overflow-y-auto lg:h-full">
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
            isPending={isPending}
          />

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
            isPending={isPending}
          />

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
            isPending={isPending}
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
              isPending={isPending}
            />
          )}
          {!isCreatingCategory && editingCategory !== null && (
            <CategoryEditForm
              key={editingCategory}
              category={categories.find(c => c.id === editingCategory)!}
              onCancel={() => setEditingCategory(null)}
              onSubmit={(updatedCategory) => handleUpdateCategory(editingCategory, updatedCategory)}
              onDelete={() => setDeleteConfirmation({ type: 'category', id: editingCategory })}
              isPending={isPending}
            />
          )}
          {isCreatingTag && (
            <TagEditForm
              key="new-tag"
              tag={null}
              onCancel={() => setIsCreatingTag(false)}
              onSubmit={handleSubmitNewTag}
              isPending={isPending}
            />
          )}
          {!isCreatingTag && editingTag !== null && (
            <TagEditForm
              key={editingTag}
              tag={tags.find(t => t.id === editingTag)!}
              onCancel={() => setEditingTag(null)}
              onSubmit={(updatedTag) => handleUpdateTag(editingTag, updatedTag)}
              onDelete={() => setDeleteConfirmation({ type: 'tag', id: editingTag })}
              isPending={isPending}
            />
          )}
          {isCreatingVolume && (
            <VolumeEditForm
              key="new-volume"
              volume={null}
              onCancel={() => setIsCreatingVolume(false)}
              onSubmit={handleSubmitNewVolume}
              isPending={isPending}
            />
          )}
          {!isCreatingVolume && editingVolume !== null && (
            <VolumeEditForm
              key={editingVolume}
              volume={volumes.find(v => v.id === editingVolume)!}
              onCancel={() => setEditingVolume(null)}
              onSubmit={(updatedVolume) => handleUpdateVolume(editingVolume, updatedVolume)}
              onDelete={() => setDeleteConfirmation({ type: 'volume', id: editingVolume })}
              isPending={isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}
