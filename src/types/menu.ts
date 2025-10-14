export interface MenuLink {
    label: string;
    href: string;
    badge?: string;
    icon?: string;
}

export interface MenuListProps {
    title?: string;
    items: MenuLink[];
    className?: string;
}

export interface FeatureCardProp {
    // id: string;
    title: string;
    description: string;
    image?: string;
    href?: string;
    badge?: string;
    fontTitle: string;
    fontContext: string;
}

export interface FeatureCardsProps {
    title?: string;
    items: FeatureCardProp[];
    className?: string;
}