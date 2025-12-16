import { getCollectionsData } from './data';
import CollectionsClient from './CollectionsClient';

export default async function CollectionsPage() {
  const collections = await getCollectionsData();

  return <CollectionsClient initialCollections={collections} />;
}
