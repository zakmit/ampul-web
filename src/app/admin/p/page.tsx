import ProductsClient from './ProductsClient';
import { getAllAdminData } from './data';
import { auth } from '@/auth';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImages,
} from './actions';

export default async function ProductsPage() {
  // Fetch product data (always available for visitors to read)
  const { categories, collections, volumes, tags, products } = await getAllAdminData();

  // Check authentication
  const session = await auth();
  let serverActions = null;

  // Only pass server actions if user is admin
  if (session && session.user.role === 'admin') {
    serverActions = {
      createProduct,
      updateProduct,
      deleteProduct,
      uploadProductImage,
      deleteProductImages,
    };
  }

  return (
    <ProductsClient
      initialProducts={products}
      categories={categories}
      collections={collections}
      volumes={volumes}
      tags={tags}
      serverActions={serverActions}
    />
  );
}
