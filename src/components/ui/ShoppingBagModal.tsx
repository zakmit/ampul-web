'use client'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { ShoppingBagItemDetails } from '@/app/actions/shoppingBag'

interface ShoppingBagModalProps {
  isOpen: boolean
  showBanner: boolean
  isAtTop: boolean
  isNavVisible: boolean
  onClose: () => void
  items: ShoppingBagItemDetails[]
  availableProducts: Array<{ value: string; label: string }>
  selectedSample: string | null
  isLoading: boolean
  onQuantityChange: (productId: string, volumeId: number, delta: number) => void
  onQuantitySet: (productId: string, volumeId: number, quantity: number) => void
  onRemoveItem: (productId: string, volumeId: number) => void
  onSampleChange: (productSlug: string | null) => void
}

export default function ShoppingBagModal({
  isOpen,
  showBanner,
  isAtTop,
  isNavVisible,
  onClose,
  items,
  availableProducts,
  selectedSample,
  isLoading,
  onQuantityChange,
  onQuantitySet,
  onRemoveItem,
  onSampleChange,
}: ShoppingBagModalProps) {
  const t = useTranslations('ShoppingBag')
  const tCommon = useTranslations('Common')
  const router = useRouter()
  const params = useParams()

  const handleQuantityInput = (productId: string, volumeId: number, value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 1) {
      const clampedValue = Math.min(numValue, 10)
      onQuantitySet(productId, volumeId, clampedValue)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const handleCheckout = () => {
    onClose()
    router.push(`/${params.locale}/checkout`)
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal // Can add tax/shipping later

  const hasItems = items.length > 0

  // Calculate top position based on NavBar visibility
  const getTopPosition = () => {
    if (!isNavVisible) {
      // NavBar is hidden - modal should be at top of screen
      return 'top-0'
    }
    if (isAtTop && showBanner) {
      // At top with banner visible: banner (h-4/h-6) + navbar (h-14)
      return 'top-18'
    }
    // NavBar visible but no banner or not at top: just navbar (h-14)
    return 'top-14'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Blur - Click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-0 bg-gray-800/30 backdrop-blur-sm z-30"
            onClick={handleClose}
          />

          {/* Modal Container - Full screen overlay on desktop, full width modal on mobile */}
          <div className={`fixed inset-0 z-50 ${getTopPosition()} lg:top-0 overflow-hidden`}>
            <motion.div
              initial={{ y: '-100%', x: 0 }}
              animate={{ y: 0, x: 0 }}
              exit={{ y: '-100%', x: 0 }}
              transition={{
                type: 'tween',
                duration: 0.45,
                ease: [0.32, 0.72, 0, 1]
              }}
              className="relative bg-white w-full h-full lg:origin-top-right"
              onClick={(e) => e.stopPropagation()}
            >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 lg:top-8 lg:right-8 text-gray-900 hover:text-gray-500 cursor-pointer transition-colors z-10"
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

          {/* Desktop Layout: 7:3 Grid */}
          <div className="hidden lg:grid lg:grid-cols-10">
            {/* Left Section - Products (70%) */}
            <div className="col-span-7 border-r border-gray-300 px-8 py-8 h-dvh flex flex-col">
              <h1 className="text-4xl font-bold mb-9">{t('title')}</h1>

              {/* Products List with overflow */}
              <div className="flex-1 overflow-y-auto pr-4">
                {!hasItems ? (
                  <p className="text-lg italic">{t('emptyMessage')}</p>
                ) : (
                  <div className="space-y-8">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.volumeId}`} className="flex gap-8">
                        {/* Product Image */}
                        <div className="relative w-48 h-48 bg-gray-100">
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="text-2xl font-title font-bold">{item.productName}</h3>
                              <button
                                onClick={() => onRemoveItem(item.productId, item.volumeId)}
                                className="text-gray-900 hover:text-gray-500 cursor-pointer"
                                aria-label="Remove item"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-5 h-5"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-sm">{item.productSubtitle}</p>
                            <p className="text-sm">{item.volumeDisplay}</p>
                          </div>

                          <div className="flex justify-between items-center">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => onQuantityChange(item.productId, item.volumeId, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <span className="text-xl">−</span>
                              </button>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={item.quantity}
                                onChange={(e) => handleQuantityInput(item.productId, item.volumeId, e.target.value)}
                                className="text-xl w-12 text-center border-b border-gray-900 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                aria-label="Quantity"
                              />
                              <button
                                onClick={() => onQuantityChange(item.productId, item.volumeId, 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <span className="text-xl">+</span>
                              </button>
                            </div>

                            {/* Price */}
                            <p className="text-xl font-semibold">{item.price}{tCommon('currency')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Summary (30%) */}
            <div className="col-span-3 px-8 py-16 flex flex-col">
              <div className="flex-1">
                {hasItems && (
                  <div className="mb-4 flex items-center justify-between">
                    <label htmlFor="free-sample" className="block text-base italic">
                      {t('freeSample')}
                    </label>
                    <div className="relative">
                      <select
                        id="free-sample"
                        value={selectedSample || ''}
                        onChange={(e) => onSampleChange(e.target.value)}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg fill='%23000000' height='24px' width='24px' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 28.769 28.769' xml:space='preserve'%3E%3Cg%3E%3Cg id='c106_arrow'%3E%3Cpath d='M28.678,5.798L14.713,23.499c-0.16,0.201-0.495,0.201-0.658,0L0.088,5.798C-0.009,5.669-0.027,5.501,0.04,5.353 C0.111,5.209,0.26,5.12,0.414,5.12H28.35c0.16,0,0.31,0.089,0.378,0.233C28.798,5.501,28.776,5.669,28.678,5.798z'/%3E%3C/g%3E%3Cg id='Capa_1_26_'%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                          backgroundSize: '1em 1em',
                        }}
                        className="w-40 px-4 py-3 pr-10 bg-gray-100 border-none appearance-none text-base cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900"
                      >
                        {availableProducts.map((product) => (
                          <option key={product.value} value={product.value}>
                            {product.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-base">
                    <span>{t('subtotal')}</span>
                    <span className="">{subtotal}{tCommon('currency')}</span>
                  </div>
                  <div className="flex justify-between text-base italic">
                    <span className='font-title'>TOTAL</span>
                    <span className="font-semibold">{total}{tCommon('currency')}</span>
                  </div>
                </div>
              </div>

              <div className='px-8'>
                <button
                  onClick={handleCheckout}
                  disabled={!hasItems}
                  className={`w-full py-4 px-6 transition-colors text-base font-medium ${
                    hasItems
                      ? 'bg-gray-700 hover:bg-gray-900 cursor-pointer text-white'
                      : 'bg-white border border-gray-700 text-gray-700 cursor-not-allowed'
                  }`}
                >
                  {t('checkout')}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Layout: Full Width with Overflow */}
          <div className="lg:hidden flex flex-col h-full">
            {/* Header */}
            <div className="mx-2 px-2 pt-12 pb-6 border-b border-gray-500">
              <h1 className="text-xl font-title font-bold text-center">{t('title')}</h1>
            </div>

            {/* Products List with overflow */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {!hasItems ? (
                <p className="italic text-center">{t('emptyMessage')}</p>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.volumeId}`} className="">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-24 h-24 shrink-0 bg-gray-100">
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="text-base font-bold">{item.productName}</h3>
                              <button
                                onClick={() => onRemoveItem(item.productId, item.volumeId)}
                                className="text-gray-900 hover:text-gray-500 cursor-pointer"
                                aria-label="Remove item"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-5 h-5"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-xs">{item.productSubtitle}</p>
                            <p className="text-xs">{item.volumeDisplay}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => onQuantityChange(item.productId, item.volumeId, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <span className="text-lg">−</span>
                              </button>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={item.quantity}
                                onChange={(e) => handleQuantityInput(item.productId, item.volumeId, e.target.value)}
                                className="text-sm w-10 text-center border-b border-gray-900 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                aria-label="Quantity"
                              />
                              <button
                                onClick={() => onQuantityChange(item.productId, item.volumeId, 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <span className="text-lg">+</span>
                              </button>
                            </div>

                            {/* Price */}
                            <p className="text-base font-semibold">{item.price}{tCommon('currency')}</p>
                          </div>

                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Section - Summary */}
            <div className="px-6 py-2 border-t border-gray-300 bg-white">
              {hasItems && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <label htmlFor="free-sample-mobile" className="block text-sm italic">
                      {t('freeSample')}
                    </label>
                    <div className="relative">
                      <select
                        id="free-sample-mobile"
                        value={selectedSample || ''}
                        onChange={(e) => onSampleChange(e.target.value)}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg fill='%23000000' height='24px' width='24px' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 28.769 28.769' xml:space='preserve'%3E%3Cg%3E%3Cg id='c106_arrow'%3E%3Cpath d='M28.678,5.798L14.713,23.499c-0.16,0.201-0.495,0.201-0.658,0L0.088,5.798C-0.009,5.669-0.027,5.501,0.04,5.353 C0.111,5.209,0.26,5.12,0.414,5.12H28.35c0.16,0,0.31,0.089,0.378,0.233C28.798,5.501,28.776,5.669,28.678,5.798z'/%3E%3C/g%3E%3Cg id='Capa_1_26_'%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                          backgroundSize: '1em 1em',
                        }}
                        className="w-40 px-4 py-2 pr-10 bg-gray-100 border-none appearance-none text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-900"
                      >
                        {availableProducts.map((product) => (
                          <option key={product.value} value={product.value}>
                            {product.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-base">
                      <span>{t('subtotal')}</span>
                      <span className="">{subtotal}{tCommon('currency')}</span>
                    </div>
                    <div className="flex justify-between text-base italic">
                      <span className="font-title">TOTAL</span>
                      <span className="font-semibold">{total}{tCommon('currency')}</span>
                    </div>
                  </div>
                </>
              )}
              <div className='flex content-center mb-4'>
                <button
                  onClick={handleCheckout}
                  disabled={!hasItems}
                  className={`w-70 mx-auto py-4 px-6 transition-colors text-base font-medium ${
                    hasItems
                      ? 'bg-gray-700 hover:bg-gray-900 cursor-pointer text-white'
                      : 'bg-white border border-gray-700 text-gray-700 cursor-not-allowed'
                  }`}
                >
                  {t('checkout')}
                </button>
              </div>
            </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
