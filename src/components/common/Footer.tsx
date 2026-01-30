'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';


interface FooterSectionProps {
  title: string;
  links: { label: string; href: string }[];
}

function FooterSection({ title, links }: FooterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="flex flex-col w-auto">
      {/* Mobile: Clickable header with +/x toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full md:cursor-default md:pointer-events-none py-3 md:py-0"
        aria-expanded={isExpanded}
      >
        <h3 className={`font-title text-xl mb-0 md:mb-2`}>{title}</h3>
        <span className="md:hidden text-2xl font-light transition-transform duration-300 ease-in-out"
              style={{ transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          +
        </span>
      </button>

      {/* Mobile: Expandable nav, Desktop: Always visible */}
      <nav
        className={`flex flex-col ml-2 space-y-2 overflow-hidden transition-all duration-300 ease-in-out md:max-h-none md:opacity-100 ${
          isExpanded ? 'max-h-96 opacity-100 mb-2' : 'max-h-0 opacity-0'
        }`}
      >
        {links.map((link, index) => (
          link.href != "#" ? (
            link.href.startsWith('https')? (
              <a key={index} className="hover:text-gray-500 hover:underline" href={link.href}>
                {link.label}
              </a>
            ) : (
              <Link key={index} className="hover:text-gray-500 hover:underline" href={link.href}>
                {link.label}
              </Link>
            )
          ):(
            <span key={index} className="hover:text-gray-500 hover:underline">
              {link.label}
            </span>
          )
        ))}
      </nav>
    </section>
  );
}

export default function Footer() {
  const t = useTranslations('Footer.sections');
  const locale = useLocale();

  const sections = [
    {
      title: t('information.title'),
      links: [
        { label: t('information.trackOrder'), href: '#' },
        { label: t('information.delivery'), href: '#' },
        { label: t('information.returns'), href: '#' },
        { label: t('information.faqs'), href: '#' },
        { label: t('information.exclusiveOffers'), href: '#' },
      ],
    },
    {
      title: t('connect.title'),
      links: [
        { label: "Instagram", href: 'https://www.instagram.com/kaaaiho12' },
        { label: "Behance", href: 'https://www.behance.net/gallery/242458065/AMPUL-A-concept-driven-digital-experience' },
        { label: "Linkedin", href: 'https://www.linkedin.com/in/kai-chih-ho-819b853a7/' },
        { label: "Github", href: 'https://github.com/zakmit/ampul-web' },
        { label: "Figma", href: 'https://www.figma.com/design/abDRQowVnEgn9bKCJhXxhI/AMPUL' },
      ],
    },
    {
      title: t('about.title'),
      links: [
        { label: t('about.concept'), href: '#' },
      ],
    },
    {
      title: t('legal.title'),
      links: [
        { label: t('legal.terms'), href: `/${locale}/legal` },
        { label: t('legal.privacy'), href: `/${locale}/legal` },
        { label: t('legal.cookies'), href: `/${locale}/legal` },
      ],
    },
  ];

  return (
    <footer className="w-full bg-gray-100">
      <div className="mx-auto w-full max-w-360 flex flex-col md:flex-row px-4 pt-4 lg:pt-8 pb-10 md:justify-around divide-y md:divide-y-0 divide-gray-300">
        {sections.map((section, index) => (
          <FooterSection
            key={index}
            title={section.title}
            links={section.links}
          />
        ))}
      </div>
    </footer>
  );
}
