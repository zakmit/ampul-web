'use client'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface AddedToBagModalProps {
  isOpen: boolean
  showBanner: boolean
  isAtTop: boolean
  isNavVisible: boolean
  onClose: () => void
  productName?: string
  productSubtitle?: string
  productImage?: string
  volumeDisplay?: string
  price?: number
  isMaxQuantityExceeded?: boolean
}

export default function AddedToBagModal({
  isOpen,
  showBanner,
  isAtTop,
  isNavVisible,
  onClose,
  productName,
  productSubtitle,
  productImage,
  volumeDisplay,
  price,
  isMaxQuantityExceeded = false,
}: AddedToBagModalProps) {
  const t = useTranslations('AddedToBag')
  const tCommon = useTranslations('Common')

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 60000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 bg-gray-800/30 backdrop-blur-sm z-30 ${getTopPosition()}`}
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className={`fixed right-0 z-50 w-full lg:w-auto flex justify-center lg:justify-end overflow-hidden ${getTopPosition()}`}>
            <motion.div
              initial={{ y: '-100%', x: 0 }}
              animate={{ y: 0, x: 0 }}
              exit={{ y: '-100%', x: 0 }}
              transition={{
                type: 'tween',
                duration: 0.35,
                ease: [0.32, 0.72, 0, 1]
              }}
              className="relative bg-white w-full h-auto lg:w-md shadow-2xl lg:origin-top-right"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-2 right-4 text-gray-900 hover:text-gray-600 transition-colors z-10"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <div className="flex flex-col h-full lg:h-auto px-6 pb-8 pt-12">
                {isMaxQuantityExceeded ? (
                  /* Error State - Maximum Quantity Exceeded */
                  <>
                    <h2 className="text-xl font-bold text-center mb-6">
                      {t('maxQuantityTitle')}
                    </h2>

                    <div className="border-t border-gray-500 mb-6 mx-2"></div>

                    <p className="text-base text-center px-4">
                      {t('maxQuantityMessage')}
                    </p>
                  </>
                ) : (
                  /* Success State - Added to Bag */
                  <>
                    {/* Title */}
                    <h2 className="text-xl font-bold text-center mb-6">
                      {t('title')}
                    </h2>

                    <div className="border-t border-gray-500 mb-6 mx-2"></div>

                    {/* Product Info */}
                    {productImage && productName && (
                      <div className="flex gap-4 mb-4">
                        {/* Product Image */}
                        <div className="relative w-32 h-32 shrink-0 bg-gray-100">
                          <Image
                            src={productImage}
                            alt={productName}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-bold">{productName}</h3>
                            <p className="text-sm">{productSubtitle}</p>
                            <p className="text-sm">{volumeDisplay}</p>
                          </div>
                          <p className="text-lg font-semibold">{price}{tCommon('currency')}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
