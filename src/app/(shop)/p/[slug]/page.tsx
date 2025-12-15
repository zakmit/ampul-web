import Link from 'next/link';
import Image from 'next/image';
import ProductImageGallery from '@/components/ProductImageGallery';
import ExpandableSections from '@/components/ExpandableSections';
import Breadcrumb from '@/components/ui/Breadcrumb';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  // Mock data - replace with actual data fetching based on slug
  // Example: const product = await fetchProduct(slug);
  const product = {
    name: 'Icarus',
    subtitle: 'Eau de Toilette',
    quote: '"His desire for a brilliant, burning dream melts his wings of survival."',
    volume: '100ml · 3.4 fl oz',
    price: 200,
    sensations: 'Sea water choked in the nose, Cinnamon and amber bring the warmness of burning sun, Melting wax flowing on the skin',
    images: [
      '/products/icare-cover.jpg',
      '/products/icare-bottle.jpg',
      '/products/icare-box.jpg',
    ],
  };

  const infoSections = [
    {
      id: 'delivery',
      title: 'Delivery',
      content: 'Delivery information will be displayed here.',
    },
    {
      id: 'returns',
      title: 'Free Returns',
      content: 'Free returns information will be displayed here.',
    },
    {
      id: 'refill',
      title: 'Refill Bottle',
      content: 'Refill bottle information will be displayed here.',
    },
  ];

  const relatedProducts = [
    {
      name: 'Cassandra',
      subtitle: 'Eau de Toilette',
      image: '/products/cassandre-bottle.jpg',
      slug: 'cassandre',
    },
    {
      name: 'Narcisse',
      subtitle: 'Eau de Toilette',
      image: '/products/narcisse-bottle.jpg',
      slug: 'narcisse',
    },
    {
      name: 'Icarus',
      subtitle: 'Eau de Toilette',
      image: '/products/icare-bottle.jpg',
      slug: 'icare',
    },
  ];

  return (
    <div className="overflow-x-hidden max-w-[1440px] mx-auto">
      {/* Main Product Section */}
      <div className="lg:flex lg:min-h-screen">
        {/* Product Image Section - Mobile: full width, Desktop: 5/8 width sticky */}
        <div className="relative w-screen h-[100vw] lg:w-[62.5%] lg:h-[900px] lg:sticky lg:top-0 flex items-center justify-center bg-transparent">
          <div className="w-full lg:max-w-none lg:w-full h-full flex items-center justify-center">
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>
        </div>

        {/* Product Details Section - Mobile: full width below, Desktop: 3/8 width */}
        <div className="bg-white lg:w-[37.5%]">
          <div className="max-w-md mx-auto lg:max-w-none px-6 lg:px-12 pt-2 lg:pt-8 pb-8 lg:pb-16">
            {/* Product Title - Mobile: center, Desktop: right-aligned */}
            <h1 className="text-4xl lg:text-5xl font-bold text-center lg:text-left lg:mb-2">
              {product.name}
            </h1>
            <p className="text-center lg:text-left text-xs lg:text-base mb-2 lg:mb-6">
              {product.subtitle}
            </p>

            {/* Quote - Mobile: center, Desktop: right-aligned */}
            <h3 className="text-center lg:text-left italic font-light mb-2 lg:mb-6 leading-relaxed lg:text-lg">
              {product.quote}
            </h3>

            {/* Volume and Add to Bag - Mobile: center, Desktop: right-aligned */}
            <div className="flex items-center justify-center gap-4 mb-8 lg:mb-8">
              <span className="text-gray-700">{product.volume}</span>
              <button className="bg-gray-500 hover:bg-gray-800 text-gray-100 font-semibold px-5 lg:px-6 py-3 rounded-md transition-colors">
                Add to bag · {product.price} $
              </button>
            </div>

            {/* Sensations */}
            <div className="mb-8 lg:mb-8 -mx-6 lg:mx-0 px-6 lg:px-0 py-6 lg:py-6 inset-shadow-[0_4px_4px_0] inset-shadow-gray-900/20 lg:inset-shadow-none bg-gray-100 ">
              <h2 className="text-2xl lg:text-3xl italic font-bold text-center mb-1 lg:mb-2 mx-auto">
                Sensations
              </h2>
              <p className="text-center italic text-sm lg:text-base text-gray-700 mx-auto">
                {product.sensations}
              </p>
            </div>

            {/* Expandable Sections */}
            <ExpandableSections sections={infoSections} />

            {/* Free Sample Note */}
            <p className="text-sm text-gray-500 mt-6 lg:mt-8 italic">
              *A free sample of your choice with every order
            </p>
          </div>
        </div>
      </div>

      {/* Explore the Collection - Mobile: scrollable, Desktop: grid */}
      <div className="bg-gray-100 inset-shadow-[0_4px_4px_0] inset-shadow-gray-900/20 lg:inset-shadow-none">
        <div className="max-w-md lg:max-w-7xl mx-auto px-6 lg:px-12 pt-6 lg:pt-16 lg:pb-16">
          <h2 className="text-3xl lg:text-4xl italic font-bold text-center mb-8 lg:mb-12">
            Explore the Collection
          </h2>

          {/* Mobile: Horizontal scroll */}
          <div className="flex lg:hidden gap-6 overflow-x-auto pb-6 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.slug}
                href={`/p/${relatedProduct.slug}`}
                className="group flex-shrink-0 w-48 snap-start"
              >
                <div className="aspect-[1] relative rounded-sm overflow-hidden mb-2">
                  <Image
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-center font-bold text-lg">
                  {relatedProduct.name}
                </h3>
                <p className="text-center text-xs">
                  {relatedProduct.subtitle}
                </p>
              </Link>
            ))}
          </div>

          {/* Desktop: Grid */}
          <div className="hidden lg:flex gap-8 justify-center">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.slug}
                href={`/p/${relatedProduct.slug}`}
                className="group flex-shrink-0 w-64"
              >
                <div className="aspect-[1] relative rounded-sm overflow-hidden mb-4">
                  <Image
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-center font-bold text-xl">
                  {relatedProduct.name}
                </h3>
                <p className="text-center text-sm">
                  {relatedProduct.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { href: '/', label: 'Home' },
          { href: '/p', label: 'Fragrances' },
          { label: product.name },
        ]}
      />
    </div>
  );
}
