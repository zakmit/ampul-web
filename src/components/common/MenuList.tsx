import { MenuListProps } from '@/types';
import Link from 'next/link';

export const MenuList = ({ title, titleLink, items, className = "", onLinkClick }: MenuListProps) => {
  return (
    <div className={className}>
      {titleLink &&
        <Link href={titleLink} onClick={onLinkClick}>
        {title && <h3 className={`text-lg italic mb-2 transition-all hover:text-gray-500 hover:underline`}>{title}</h3>}
        </Link>
      }
      {items.length > 0 && (
        <ul className={`space-y-2 ${title ? "ml-1": "ml-0"}`}>
          {items.map((item, index) => (
            <li key={index}>
              <Link href={item.href} className="text-base hover:text-gray-500 hover:underline" onClick={onLinkClick}>
                {item.label}
                {item.badge && (
                  <span className="ml-2 px-2 py-0.5 text-xs text-gray-500">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )
      }
    </div>
  );
};