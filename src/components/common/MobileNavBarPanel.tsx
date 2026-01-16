'use client';

import { MenuList, MenuCard } from "@/components/common";
import { useEffect, useState } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { m, AnimatePresence } from 'framer-motion';

interface MobileNavBarPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNavBarPanel({isOpen, onClose}: MobileNavBarPanelProps) {
  const t = useTranslations('NavBar');
  const locale = useLocale();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Reset active section when panel closes
  useEffect(() => {
    if (!isOpen) {
      setActiveSection(null);
    }
  }, [isOpen]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  const fragItems = [
    { label: `${t('productTitles.icare')}`, href: `/${locale}/p/icare` },
    { label: `${t('productTitles.antigone')}`, href: `/${locale}/p/antigone` },
    { label: `${t('productTitles.cassandre')}`, href: `/${locale}/p/cassandre` },
    { label: `${t('productTitles.narcisse')}`, href: `/${locale}//p/narcisse` }
  ];
  const menuItems = [
    {
      id: 'new',
      label: t('menu.new'),
      content: (
        <div className="h-full flex flex-col justify-between">
          <div>
            <Link href={`/${locale}/e/greek-mythology`} onClick={onClose}>
              <div className={`text-base font-medium mb-2`}>{t('exploreGreekMythology')}</div>
            </Link>
          </div>
          <div className="flex flex-col gap-6">
            <MenuCard title={t('productTitles.narcisse')} description={t('productDescriptions.narcisse')} image="/products/narcisse-bottle.jpg" href={`/${locale}/p/narcisse`} badge={t('badge.new')} onLinkClick={onClose}></MenuCard>
          </div>
        </div>
      )
    },
    {
      id: 'fragrance',
      label: t('menu.fragrance'),
      content: (
        <div className="h-full flex flex-col justify-between">
          <div className="">
            <MenuList title={t('greekMythologyCollection')} titleLink={`/${locale}/c/greek-mythology`} items={fragItems} onLinkClick={onClose}></MenuList>
          </div>
          <div className="flex flex-col gap-6 w-full items-center">
            <MenuCard title={t('productTitles.antigone')} description={t('productDescriptions.antigone')} image="/products/antigone-bottle.jpg" href={`/${locale}/p/antigone`} badge={t('badge.new')} onLinkClick={onClose}></MenuCard>
          </div>
        </div>
      )
    },
    {
      id: 'about',
      label: t('menu.about'),
      content: (
        <div className="h-full flex flex-col justify-between overflow-y-scroll px-2 pb-14 gap-3 items-center">
            <MenuCard title={t('aboutSections.concept.title')} description={t('aboutSections.concept.description')} image="/products/concept.jpg" onLinkClick={onClose}></MenuCard>
            <MenuCard title={t('aboutSections.bottle.title')} description={t('aboutSections.bottle.description')} image="/products/icare-bottle.jpg" onLinkClick={onClose}></MenuCard>
            <MenuCard title={t('aboutSections.box.title')} description={t('aboutSections.box.description')} image="/products/narcisse-box.jpg" onLinkClick={onClose}></MenuCard>
        </div>
      )
    }
  ];

  return (
    <div>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-800/20 z-55 transition-all backdrop-blur-xs duration-600"
          onClick={onClose}
      />)}
      <div
        className={`fixed top-0 left-0 h-full w-[80dvw] bg-white z-60 transform transition-transform duration-300 px-3 py-7 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close Menu panel"
        >
          <X className="w-6 h-6" strokeWidth={1.5}/>
        </button>

        <div className="relative h-full overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {activeSection === null ? (
              // Main menu
              <m.div
                key="main-menu"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{
                  type: 'tween',
                  duration: 0.35,
                  ease: [0.32, 0.72, 0, 1] // Custom cubic-bezier for smooth deceleration
                }}
                className="flex flex-col h-full py-7 px-6 gap-8"
              >
                <button
                  onClick={() => setActiveSection('new')}
                  className="text-left"
                >
                  <h2 className="text-2xl">{t('menu.new')}</h2>
                </button>
                <button
                  onClick={() => setActiveSection('fragrance')}
                  className="text-left"
                >
                  <h2 className="text-2xl">{t('menu.fragrance')}</h2>
                </button>
                <button
                  onClick={() => setActiveSection('about')}
                  className="text-left"
                >
                  <h2 className="text-2xl">{t('menu.about')}</h2>
                </button>
              </m.div>
            ) : (
              // Sub-panel
              <m.div
                key={activeSection}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{
                  type: 'tween',
                  duration: 0.35,
                  ease: [0.32, 0.72, 0, 1] // Custom cubic-bezier for smooth deceleration
                }}
                className="absolute inset-0 flex flex-col h-full"
              >
                <button
                  onClick={() => setActiveSection(null)}
                  className="flex items-center gap-2 mb-6 text-gray-700 group cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5"/>
                  <span className="text-base group-hover:underline">{menuItems.find(item => item.id === activeSection)?.label}</span>
                </button>
                {/* Content placeholder - you can add content here later */}
                <div className="flex-1 px-3 h-full">
                  {menuItems.find(item => item.id === activeSection)?.content}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}