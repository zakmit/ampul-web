import Link from 'next/link';

interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="bg-white lg:bg-white py-8">
      <div className="max-w-md lg:max-w-7xl mx-auto px-6 lg:px-12">
        <nav aria-label="Breadcrumb" className="text-xs lg:text-sm text-gray-600">
          <ol className="flex items-center gap-2">
            {items.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && <span>&gt;</span>}
                {item.href ? (
                  <Link href={item.href} className="hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-medium">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
