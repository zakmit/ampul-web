import { MenuLink, MenuListProps } from '@/types';

export const MenuList = ({ title, items, className = "" }: MenuListProps) => {
  return (
    <div className={className}>
      {title && <h3 className={`text-lg mb-2 font-title`}>{title}</h3>}
      {items.length > 0 && (
        <ul className={`space-y-2 font-context ${title ? "ml-1": "ml-0"}`}>
          {items.map((item, index) => (
            <li key={index}>
              <a href={item.href} className="text-base">
                {item.label}
                {item.badge && (
                  <span className="ml-2 px-2 py-0.5 text-xs text-gray-500">
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )
      }
    </div>
  );
};