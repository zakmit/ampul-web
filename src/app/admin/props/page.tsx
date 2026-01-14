import { getPropertiesData } from './data';
import PropertiesClient from './PropertiesClient';
import { auth } from '@/auth';
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

export default async function PropertiesPage() {
  // Fetch property data (always available for visitors to read)
  const { categories, tags, volumes } = await getPropertiesData();

  // Check authentication
  const session = await auth();
  let serverActions = null;

  // Only pass server actions if user is admin
  if (session && session.user.role === 'admin') {
    serverActions = {
      createCategory,
      updateCategory,
      deleteCategory,
      createTag,
      updateTag,
      deleteTag,
      createVolume,
      updateVolume,
      deleteVolume,
    };
  }

  return (
    <PropertiesClient
      initialCategories={categories}
      initialTags={tags}
      initialVolumes={volumes}
      serverActions={serverActions}
    />
  );
}
