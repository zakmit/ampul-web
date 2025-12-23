import ProductsClient from './ProductsClient';
import { getAllAdminData } from './data';

export default async function ProductsPage() {
  const { categories, collections, volumes, tags, products } = await getAllAdminData();

  return (
    <ProductsClient
      initialProducts={products}
      categories={categories}
      collections={collections}
      volumes={volumes}
      tags={tags}
    />
  );
}
