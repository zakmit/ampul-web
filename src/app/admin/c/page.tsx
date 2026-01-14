import { getCollectionsData } from './data';
import CollectionsClient from './CollectionsClient';
import { auth } from '@/auth';
import {
  createCollection,
  updateCollection,
  deleteCollection,
  uploadCollectionImage,
  deleteCollectionImages,
} from './actions';

export default async function CollectionsPage() {
  // Fetch collection data (always available for visitors to read)
  const collections = await getCollectionsData();

  // Check authentication
  const session = await auth();
  let serverActions = null;

  // Only pass server actions if user is admin
  if (session && session.user.role === 'admin') {
    serverActions = {
      createCollection,
      updateCollection,
      deleteCollection,
      uploadCollectionImage,
      deleteCollectionImages,
    };
  }

  return (
    <CollectionsClient
      initialCollections={collections}
      serverActions={serverActions}
    />
  );
}
