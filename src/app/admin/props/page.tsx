import { getPropertiesData } from './data';
import PropertiesClient from './PropertiesClient';

export default async function PropertiesPage() {
  const { categories, tags, volumes } = await getPropertiesData();

  return (
    <PropertiesClient
      initialCategories={categories}
      initialTags={tags}
      initialVolumes={volumes}
    />
  );
}
