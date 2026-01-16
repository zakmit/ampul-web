import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import AddToBagButton from '@/components/product/AddToBagButton';

export interface Product {
  id: string;
  name: string;
  quote: string;
  price: number;
  volume: string; // Display name (translated, e.g., "50 ml")
  volumeValue?: string; // Raw value for filtering (e.g., "50ml")
  volumeId: number; // Volume ID for shopping bag
  image: string;
  slug: string;
  collectionId?: number;
  collectionSlug?: string;
  tagIds?: number[];
  tagSlugs?: string[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('ProductDetail');
  const tCommon = useTranslations('Common');
  const locale = useLocale();

  return (
    <div className="flex flex-col group">
      <Link href={`/${locale}/p/${product.slug}`} className="">
        <div className="relative aspect-square mb-4 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="flex flex-col flex-1">
        <Link href={`/${locale}/p/${product.slug}`}>
          <h3 className="text-center text-xl font-bold mb-1 hover:text-gray-500 hover:underline">{product.name}</h3>
        </Link>

        <p className="text-sm italic text-center text-gray-900 mb-2">
          {product.quote}
        </p>

        <div className="mt-auto mx-4 lg:mx-0 lg:grid lg:grid-cols-2">
          <div className="flex items-center justify-center mb-3 lg:my-auto">
            <span className="text-sm text-gray-900">{product.volume} · {product.price} {tCommon('currency')}</span>
          </div>

          <AddToBagButton
            productId={product.id}
            volumeId={product.volumeId}
            label={t('addToBag')}
            className="w-full text-sm bg-gray-700 hover:bg-gray-900 text-white shadow-sm font-semibold py-2 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
