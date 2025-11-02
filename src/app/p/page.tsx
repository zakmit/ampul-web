import { useTranslations } from 'next-intl';

export default function ProductsPage() {
  const t = useTranslations();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Products Overview</h1>
      {/* Product listing will be implemented here */}
    </div>
  );
}
