import { FeatureCardProp } from "@/types";
import Image from 'next/image'
import Link from 'next/link';

export const MenuCard = ({ title, description, image, href, badge, onLinkClick } : FeatureCardProp) => {
    return (
        <div className="w-full max-w-100 lg:w-64">
            { !!href ? (
                <Link href={href} onClick={onLinkClick} className="group">
                    {image &&
                        <div className="w-full aspect-square lg:w-64 lg:h-64 mb-1 relative overflow-hidden">
                            <Image src={image} fill alt={title} placeholder="blur" blurDataURL="..." className="group-hover:scale-110 transition-transform duration-300"/>
                        </div>
                    }
                    <div className="mx-2">
                        <span className="flex">
                            <h3 className="text-lg font-bold">{title}</h3>
                            {badge && (
                                <span className="ml-2 px-2 py-0.5 text-xs text-gray-500">
                                    {badge}
                                </span>
                            )}
                        </span>
                        <span className="text-sm">{description}</span>
                    </div>
                </Link>
            ):(
                <div>
                    {image &&
                        <div className="w-full aspect-square lg:w-64 lg:h-64 mb-1 relative">
                            <Image src={image} fill alt={title} placeholder="blur" blurDataURL="..."/>
                        </div>
                    }
                    <div className="mx-2">
                        <span className="flex">
                            <h3 className="text-lg font-bold">{title}</h3>
                            {badge && (
                                <span className="ml-2 px-2 py-0.5 text-xs text-gray-500">
                                    {badge}
                                </span>
                            )}
                        </span>
                        <span className="text-sm">{description}</span>
                    </div>
                </div>
            )}
        </div>
    );
};