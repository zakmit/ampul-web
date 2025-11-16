import Link from 'next/link';
import Image from 'next/image';

export interface Product {
  id: string;
  name: string;
  quote: string;
  price: number;
  volume: string;
  image: string;
  slug: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="flex flex-col">
      <Link href={`/p/${product.slug}`} className="group">
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
        <Link href={`/p/${product.slug}`}>
          <h3 className="text-center text-2xl font-bold mb-1 hover:underline">{product.name}</h3>
        </Link>

        <p className="text-sm italic text-center text-gray-900 mb-2">
          {product.quote}
        </p>

        <div className="mt-auto mx-6 lg:mx-2 lg:grid lg:grid-cols-2">
          <div className="flex items-center justify-center mb-3 lg:my-auto">
            <span className="text-sm text-gray-900">{product.volume} · {product.price} $</span>
          </div>

          <button className="w-full text-sm bg-gray-500 hover:bg-gray-800 text-white shadow-sm font-semibold py-2 transition-colors">
            Add to bag
          </button>
        </div>
      </div>
    </div>
  );
}
