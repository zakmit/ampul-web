'use client'
import { useState, useEffect, useRef } from 'react'
import { MenuList, MenuCard } from "@/components/common";
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import MobileNavBarPanel from '@/components/common/MobileNavBarPanel';
import SignInModal from '@/components/modals/SignInModal';
import SearchModal from '@/components/modals/SearchModal'
import ShoppingBagModalWrapper from '@/components/modals/ShoppingBagModalWrapper';
import AddedToBagModalWrapper from '@/components/modals/AddedToBagModalWrapper';
import { useShoppingBag } from '@/components/providers/ShoppingBagProvider';
interface NavbarProps {
  showBanner?: boolean;
  bannerHeight?: number;
}
const dropMenuStyle = "bg-white z-40 left-0 right-0 px-6 gap-6 flex justify-between";
const navHeight = 14;
const menuListStyle = "pr-4";
export default function NavBar({ showBanner = true,
    bannerHeight = 6 // h-6
    }: NavbarProps) {
  const t = useTranslations('NavBar');
  const locale = useLocale();


  const { totalItems, forceNavVisible } = useShoppingBag();
  const [isNavVisible, setIsNavVisible] = useState(true)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(false)

  const [lastScrollY, setLastScrollY] = useState(0)
  const [isAtTop, setIsAtTop] = useState(true)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isShoppingBagOpen, setIsShoppingBagOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);


  const currentBannerState = useRef(showBanner)

  useEffect(() => {
    currentBannerState.current = showBanner
  }, [showBanner])

  // Immediately show navbar when forceNavVisible becomes true
  useEffect(() => {
    if (forceNavVisible) {
      setIsNavVisible(true)
    }
  }, [forceNavVisible])

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY
      const isCurrentlyAtTop = currentScrollY <= 10

      setIsAtTop(isCurrentlyAtTop)

      // If forceNavVisible is true, always show navbar
      if (forceNavVisible) {
        setIsNavVisible(true)
        return
      }

      if (isCurrentlyAtTop) {
        setIsNavVisible(true)
      } else {
        // Detect scroll direction
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // scroll down -> hide NavBar
          setIsNavVisible(false)
        } else if (currentScrollY < lastScrollY) {
          // scroll up -> show NavBar
          setIsNavVisible(true)
        }
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', controlNavbar)
    return () => window.removeEventListener('scroll', controlNavbar)
  }, [lastScrollY, forceNavVisible])

    const getNavPosition = () => {
        if (!isNavVisible) {  // hide -> translate up
          return '-translate-y-full'
        }
        return 'translate-y-0'
    }

    const getNavTopPosition = () => {
        if (isAtTop && showBanner) {
          return 'relative'
        }
        return 'fixed'
    }

  const fragItems = [
    { label: `${t('productTitles.icare')}`, href: `/${locale}/p/icare` },
    { label: `${t('productTitles.antigone')}`, href: `/${locale}/p/antigone` },
    { label: `${t('productTitles.cassandre')}`, href: `/${locale}/p/cassandre` },
    { label: `${t('productTitles.narcisse')}`, href: `/${locale}//p/narcisse` }
  ];


    const closeDropdown = () => setIsDropdownVisible(false);

    const menuItems = [
      {
        id: 'new',
        label: t('menu.new'),
        content: (
          <div className={dropMenuStyle}>
            <div>
              <Link className={`text-base font-medium mb-2 hover:text-gray-500 hover:underline`} href={`/${locale}/e/greek-mythology`} onClick={closeDropdown}>
                {t('exploreGreekMythology')}
              </Link>
            </div>
            <div className="flex flex-row gap-6">
              <MenuCard title={t('productTitles.cassandre')} description={t('productDescriptions.cassandre')} image="/products/cassandre-bottle.jpg" href={`/${locale}/p/cassandre`} badge={t('badge.new')} onLinkClick={closeDropdown}></MenuCard>
              <MenuCard title={t('productTitles.narcisse')} description={t('productDescriptions.narcisse')} image="/products/narcisse-bottle.jpg" href={`/${locale}/p/narcisse`} badge={t('badge.new')} onLinkClick={closeDropdown}></MenuCard>
            </div>
          </div>
        )
      },
      {
        id: 'fragrance',
        label: t('menu.fragrance'),
        content: (
          <div className={dropMenuStyle}>
            <div className="">
              <MenuList title={t('greekMythologyCollection')} titleLink={`/${locale}/c/greek-mythology`} items={fragItems} className={menuListStyle} onLinkClick={closeDropdown}></MenuList>
            </div>
            <div className="flex flex-row gap-6">
              <MenuCard title={t('productTitles.icare')} description={t('productDescriptions.icare')} image="/products/icare-bottle.jpg" href={`/${locale}/p/icare`} badge={t('badge.new')} onLinkClick={closeDropdown}></MenuCard>
              <MenuCard title={t('productTitles.antigone')} description={t('productDescriptions.antigone')} image="/products/antigone-bottle.jpg" href={`/${locale}/p/antigone`} badge={t('badge.new')} onLinkClick={closeDropdown}></MenuCard>
            </div>
          </div>
        )
      },
      {
        id: 'about',
        label: t('menu.about'),
        content: (
          <div className="bg-white z-40 left-0 right-0 px-6 gap-16 flex justify-start">
              <MenuCard title={t('aboutSections.concept.title')} description={t('aboutSections.concept.description')} image="/products/concept.jpg" onLinkClick={closeDropdown}></MenuCard>
              <MenuCard title={t('aboutSections.bottle.title')} description={t('aboutSections.bottle.description')} image="/products/icare-bottle.jpg" onLinkClick={closeDropdown}></MenuCard>
              <MenuCard title={t('aboutSections.box.title')} description={t('aboutSections.box.description')} image="/products/narcisse-box.jpg" onLinkClick={closeDropdown}></MenuCard>
          </div>
        )
      }
    ];
    const handleMouseEnter = (itemId: string) => {
      setActiveDropdown(itemId);
      setIsDropdownVisible(true);
      };

    const handleMouseLeave = () => {
      setIsDropdownVisible(false);
    };
    return(
      <div>
        <div className={`relative block content-center transition-all duration-600 items-center z-50 gap-x-6 h-4 lg:h-6 ${isDropdownVisible ? "bg-gray-600" : "bg-gray-200"}`}>
          <div className="block items-center gap-x-4 gap-y-2">
            <h4 className={`text-center text-xs lg:text-base ${isDropdownVisible ? "text-gray-100": "text-gray-900"}`}>
              {t('banner')}
            </h4>
          </div>
        </div>        
        <header className={`bg-white top-0 left-0 right-0 w-full z-50 transition-all duration-300 ease-in-out ${getNavPosition()} ${getNavTopPosition()} ${
          isDropdownVisible
            ? `shadow-none`
            : `shadow-sm`
        }

        `}>
          <nav aria-label="Global" className="mx-auto flex min-w-2xs w-full max-w-360 z-50 items-center px-2 lg:px-4 h-14">
              <div className="flex lg:hidden">
                  {/* Mobile menu button */}
                  <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavVisible(true);
                    setIsSignInModalOpen(false);
                    setIsShoppingBagOpen(false);
                    setIsSearchModalOpen(false);
                  }}
                  className="inline-flex items-center justify-center rounded-md p-1 text-gray-700"
                  >
                  <span className="sr-only">{t('openMenu')}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8" style={{fillRule: 'evenodd', clipRule: 'evenodd', strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 1.5 }}>
                    <g transform="matrix(0.882353,0,0,1,0.970588,2.5)">
                      <path d="M4.567,4L20.433,4" fill="none" strokeWidth="1.1px" />
                    </g>
                    <g transform="matrix(0.882353,0,0,1,0.970588,-3.5)">
                      <path d="M4.567,21L20.433,21" fill="none" strokeWidth="1.1px" />
                    </g>
                    <g transform="matrix(0.882353,0,0,1,0.970588,0)">
                      <path d="M4.567,12L20.433,12" fill="none" strokeWidth="1.1px" />
                    </g>
                  </svg>
                  </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMobileNavVisible(false);
                  setIsSignInModalOpen(false);
                  setIsShoppingBagOpen(false);
                  setIsSearchModalOpen(true);
                }}
                onMouseEnter={() => setIsDropdownVisible(false)}

                className="inline-flex lg:hidden items-center justify-center rounded-md p-1 text-gray-900"
                >
                <span className="sr-only">{t('search')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="size-8" style={{fillRule: 'evenodd', clipRule: 'evenodd', strokeLinecap: 'square', strokeLinejoin: 'round', strokeMiterlimit: 1.5 }}>
                    <g transform="matrix(0.091376,0,0,0.091376,-2.83008,-2.4913)">
                    <circle cx="155" cy="145" r="75" style={{fill: 'none', strokeWidth:'10.94px'}}/>
                    </g>
                    <g transform="matrix(0.0740887,0,0,0.0740887,1.14601,1.31192)">
                    <path d="M199,200.773L248,260" style={{fill:'none', strokeWidth:'13.5px'}}/>
                    </g>
                </svg>
              </button>
              <div className="flex grow lg:grow-0 h-10 w-36 relative">
                  <Link href={`/${locale}/`} className="items-center py-auto">
                    <span className="sr-only">AMPUL</span>
                    <Image
                        src="/AMPUL.png"
                        fill
                        className="object-contain"
                        alt="AMPUL"
                    />
                  </Link>
              </div>
              <div className={`hidden lg:flex-1 lg:flex lg:mr-4`}>
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="hidden lg:flex h-14"
                    onMouseEnter={() => handleMouseEnter(item.id) }
                  >
                    <button className={`w-49 text-xl transition-colors font-title duration-200 ${isDropdownVisible && (activeDropdown === item.id) ? "text-gray-500 underline": "text-gray-900 no-underline"}`}>
                      {item.label}
                    </button>
                  </div>
                ))}
              </div>
              <div className="items-end">
                  <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavVisible(false);
                    setIsSignInModalOpen(false);
                    setIsShoppingBagOpen(false);
                    setIsSearchModalOpen(true);
                  }}
                  onMouseEnter={() => setIsDropdownVisible(false)}
                  className="hidden lg:inline-flex items-center justify-center rounded-md p-2 text-gray-900"
                  >
                    <span className="sr-only">{t('search')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="size-8" style={{fillRule: 'evenodd', clipRule: 'evenodd', strokeLinecap: 'square', strokeLinejoin: 'round', strokeMiterlimit: 1.5 }}>
                      <g transform="matrix(0.091376,0,0,0.091376,-2.83008,-2.4913)">
                      <circle cx="155" cy="145" r="75" style={{fill: 'none', strokeWidth:'10.94px'}}/>
                      </g>
                      <g transform="matrix(0.0740887,0,0,0.0740887,1.14601,1.31192)">
                      <path d="M199,200.773L248,260" style={{fill:'none', strokeWidth:'13.5px'}}/>
                      </g>
                    </svg>
                  </button>

                  <button
                  type="button"
                  onClick={() => {
                    setIsMobileNavVisible(false);
                    setIsSearchModalOpen(false);
                    setIsSignInModalOpen(true);
                    setIsShoppingBagOpen(false);
                  }}
                  onMouseEnter={() => setIsDropdownVisible(false)}
                  className="inline-flex items-center justify-center rounded-md p-1 lg:p-2 text-gray-900"
                  >
                    <span className="sr-only">{t('user')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={16} stroke="currentColor" className="size-8" style={{fillRule: 'evenodd', clipRule: 'evenodd', strokeLinecap: 'round', strokeLinejoin: 'round', strokeMiterlimit: 1.5 }}>
                        <g transform="matrix(0.0742212,0,0,0.0755272,0.866816,-2.29218)">
                        <circle cx="150" cy="130" r="50" style={{fill: 'none', strokeWidth:'11.8px'}}/>
                        </g>
                        <g transform="matrix(0.0706869,0,0,0.0706869,1.40202,1.87141)">
                        <path d="M40,260C40,260 34.706,186.727 40,180C79.181,130.216 225.826,130.522 260,180C264.973,187.2 260,260 260,260L40,260Z" style={{fill: 'none', strokeWidth: '12.5px' }}/>
                        </g>
                    </svg>
                  </button>

                  <button
                  type="button"
                  onClick={() => {
                    setIsShoppingBagOpen(true);
                    setIsMobileNavVisible(false);
                    setIsSignInModalOpen(false);
                    setIsSearchModalOpen(false);
                  }}
                  onMouseEnter={() => setIsDropdownVisible(false)}
                  className="inline-flex items-center justify-center rounded-md p-1 lg:p-2 text-gray-900 relative"
                  >
                  <span className="sr-only">{t('shoppingBag')}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="size-8" style={{fillRule: 'evenodd', clipRule: 'evenodd', strokeLinecap: 'square', strokeMiterlimit: 1.5 }}>
                      <path d="M19.2,7.195l0,10.047c0,1.849 -1.501,3.35 -3.349,3.35l-7.702,-0c-1.848,-0 -3.349,-1.501 -3.349,-3.35l0,-10.047l14.4,0Z" style={{fill: 'none', strokeWidth: '1px' }}/>
                      <path d="M8,11.2c0.001,-9.598 8.004,-9.598 8,0" style={{fill: 'none', strokeWidth: '1px', strokeLinecap: 'round'}} />
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute top-4.5 right-3.5 lg:top-[21px] lg:right-4.5 bg-gray-900 text-white text-xs font-semibold rounded-full w-3 h-3 flex items-end justify-center">
                      {totalItems}
                    </span>
                  )}
                  </button>
              </div>
              </nav>
            {/* Background Blur */}
            {isDropdownVisible && (
              <div 
                className={`fixed inset-0 bg-gray-800/20 top-14 h-screen z-20 transition-all backdrop-blur-xs duration-600`}
                onMouseEnter={handleMouseLeave}
              />
            )}

            {/* Dropdown Menu */}
            <div
              className={`fixed hidden lg:block left-0 right-0 bg-white shadow-sm z-40 overflow-hidden transition-all duration-600 ease-in-out ${
                isDropdownVisible
                  ? `top-14 opacity-100 max-h-lvh`
                  : `top-14 max-h-0`
              }`}
            >
              <div className="max-w-360 mx-8">
                {activeDropdown && (
                  <div className="py-8">
                    {menuItems.find(item => item.id === activeDropdown)?.content}
                  </div>
                )}
              </div>
            </div>
          </header>
          <MobileNavBarPanel
            isOpen={isMobileNavVisible}
            onClose={() => setIsMobileNavVisible(false)}
          />
          {/* Sign In Modal */}
          <SignInModal
            isOpen={isSignInModalOpen}
            showBanner={showBanner}
            isAtTop={isAtTop}
            isNavVisible={isNavVisible}
            onClose={() => setIsSignInModalOpen(false)}
          />
          <SearchModal
            isOpen={isSearchModalOpen}
            showBanner={showBanner}
            isAtTop={isAtTop}
            isNavVisible={isNavVisible}
            onClose={() => setIsSearchModalOpen(false)}
          />

          {/* Shopping Bag Modal */}
          <ShoppingBagModalWrapper
            isOpen={isShoppingBagOpen}
            showBanner={showBanner}
            isAtTop={isAtTop}
            isNavVisible={isNavVisible}
            onClose={() => setIsShoppingBagOpen(false)}
          />

          {/* Added to Bag Modal */}
          <AddedToBagModalWrapper
            showBanner={showBanner}
            isAtTop={isAtTop}
          />
        </div>
    )
}