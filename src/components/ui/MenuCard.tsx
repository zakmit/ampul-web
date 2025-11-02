import { FeatureCardProp } from "@/types";
import Image from 'next/image'

export const MenuCard = ({ title, description, image, href, badge, fontTitle, fontContext} : FeatureCardProp) => {
    return (
        <div className="w-[256px]">
            <a href={href}>
                {image && 
                    <div className="w-[256px] h-[256px] relative">
                        <Image src={image} fill alt={title} placeholder="blur" blurDataURL="..."/>
                    </div>
                }
                <div className="mx-2">
                    <span className="flex">
                        <h3 className={`${fontTitle} text-lg`}>{title}</h3>
                        {badge && (
                            <span className="ml-2 px-2 py-0.5 text-xs text-gray-500">
                                {badge}
                            </span>
                        )}
                    </span>
                    <span className={`${fontContext} text-sm`}>{description}</span>
                </div>
            </a>
        </div>
    );
};