export interface MenuLink {
    label: string;
    href: string;
    badge?: string;
    icon?: string;
}

export interface MenuListProps {
    title?: string;
    titleLink?: string;
    items: MenuLink[];
    className?: string;
    onLinkClick?: () => void;
}

export interface FeatureCardProp {
    // id: string;
    title: string;
    description: string;
    image?: string;
    href?: string;
    badge?: string;
    onLinkClick?: () => void;
}

export interface FeatureCardsProps {
    title?: string;
    items: FeatureCardProp[];
    className?: string;
}