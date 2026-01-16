'use client'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { X } from 'lucide-react'
import Image from 'next/image'
import { m, AnimatePresence } from 'framer-motion'

interface SearchResult {
  id: string | number
  slug: string
  name: string
  subtitle: string
  description: string
  image: string
  type: 'product' | 'collection'
}

interface SearchModalProps {
  isOpen: boolean
  showBanner: boolean
  isAtTop: boolean
  isNavVisible: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, showBanner, isAtTop, isNavVisible, onClose }: SearchModalProps) {
  const t = useTranslations('SearchModal')
  const locale = useLocale()
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleClose = () => {
    setSearchInput('')
    setSearchResults([])
    setHasSearched(false)
    onClose()
  }

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&locale=${locale}`)
      const data = await response.json()

      if (response.ok) {
        setSearchResults(data.results || [])
      } else {
        console.error('Search failed:', data.error)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch(searchInput)
    }
  }

  // Calculate top position based on NavBar visibility
  const getTopPosition = () => {
    if (!isNavVisible) {
      // NavBar is hidden - modal should be at top of screen
      return 'top-0'
    }
    if (isAtTop && showBanner) {
      // At top with banner visible: banner (h-4/h-6) + navbar (h-14)
      return 'top-18 lg:top-20'
    }
    // NavBar visible but no banner or not at top: just navbar (h-14)
    return 'top-14'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Blur - Click to close - extends under navbar */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-30 ${getTopPosition()}`}
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div className={`fixed right-0 z-50 w-full lg:w-auto flex justify-center lg:justify-end overflow-hidden ${getTopPosition()}`}>
            <m.div
              initial={{ y: '-100%', x: 0 }}
              animate={{ y: 0, x: 0 }}
              exit={{ y: '-100%', x: 0 }}
              transition={{
                type: 'tween',
                duration: 0.35,
                ease: [0.32, 0.72, 0, 1]
              }}
              className="relative bg-white w-full h-auto shadow-2xl lg:origin-top-right"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-4 text-gray-900 hover:text-gray-600 transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-6 h-6" strokeWidth={1.5}/>
              </button>

              {/* Content */}
              <div className="flex flex-col h-full lg:w-md lg:h-auto px-6 pb-8 pt-12 overflow-y-auto overflow-x-hidden">
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full text-right h-8 pl-10 pr-4 py-1 border rounded-sm border-gray-500 text-sm placeholder:italic focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{fillRule: 'evenodd', clipRule: 'evenodd', strokeLinecap: 'square', strokeLinejoin: 'round', strokeMiterlimit: 1.5 }}
                  className="absolute top-13 left-7 size-6 text-gray-900">
                    <g transform="matrix(0.091376,0,0,0.091376,-2.83008,-2.4913)">
                    <circle cx="155" cy="145" r="75" style={{fill: 'none', strokeWidth:'10.94px'}}/>
                    </g>
                    <g transform="matrix(0.0740887,0,0,0.0740887,1.14601,1.31192)">
                    <path d="M199,200.773L248,260" style={{fill:'none', strokeWidth:'13.5px'}}/>
                    </g>
                  </svg>
                </div>
                <div className='flex flex-col divide-y divide-gray-500 max-h-140 -mx-6 px-6 overflow-y-auto'>
                  {isSearching ? (
                    <div className="text-center py-8 text-gray-500">
                      {t('searching')}
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <Link
                        key={`${result.type}-${result.slug}`}
                        href={`/${locale}/${result.type === 'product' ? 'p' : 'c'}/${result.slug}`}
                        onClick={handleClose}
                        className="flex gap-4 pb-3 pt-3 hover:bg-gray-100 transition-colors -mx-6 px-6"
                      >
                        {/* Image */}
                        <div className="relative w-32 h-32 shrink-0 bg-gray-100">
                          <Image
                            src={result.image}
                            alt={result.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col">
                          <div>
                            <h3 className="text-lg font-bold">{result.name}</h3>
                            <p className="text-sm mb-2">{result.subtitle}</p>
                          </div>
                          <p className="text-sm italic">{result.description}</p>
                        </div>
                      </Link>
                    ))
                  ) : hasSearched ? (
                    <h3 className="text-center italic py-8 text-gray-500">
                      {t('noResults')}
                    </h3>
                  ) : (
                    <h3 className="text-center italic py-8 text-gray-500">
                      {t('searchPrompt')}
                    </h3>
                  )}
                </div>
              </div>
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
