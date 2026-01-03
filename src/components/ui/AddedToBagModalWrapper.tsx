'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useShoppingBag } from '@/components/providers/ShoppingBagProvider'
import { getShoppingBagItems, type ShoppingBagItemDetails } from '@/app/actions/shoppingBag'
import AddedToBagModal from './AddedToBagModal'
import type { Locale } from '@/i18n/config'

interface AddedToBagModalWrapperProps {
  showBanner: boolean
  isAtTop: boolean
}

export default function AddedToBagModalWrapper({
  showBanner,
  isAtTop,
}: AddedToBagModalWrapperProps) {
  const locale = useLocale() as Locale
  const { addedProduct, clearAddedProduct, setForceNavVisible } = useShoppingBag()
  const [productDetails, setProductDetails] = useState<ShoppingBagItemDetails | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Fetch product details when addedProduct changes
  useEffect(() => {
    if (addedProduct) {
      // Force navbar to be visible when modal opens
      setForceNavVisible(true)

      // If max quantity exceeded, show error modal immediately without fetching
      if (addedProduct.isMaxQuantityExceeded) {
        setProductDetails(null)
        setIsOpen(true)
      } else {
        // Convert AddedProductInfo to ShoppingBagItem with quantity 1
        getShoppingBagItems([{ productId: addedProduct.productId, volumeId: addedProduct.volumeId, quantity: 1 }], locale)
          .then((items) => {
            if (items.length > 0) {
              setProductDetails(items[0])
              setIsOpen(true)
            }
          })
          .catch((error) => {
            console.error('Failed to fetch added product details:', error)
          })
      }
    }
  }, [addedProduct, locale, setForceNavVisible])

  const handleClose = () => {
    setIsOpen(false)
    clearAddedProduct()
    setProductDetails(null)
    // Allow navbar to hide again when modal closes
    setForceNavVisible(false)
  }

  // Don't render if modal is not open
  if (!isOpen) return null

  return (
    <AddedToBagModal
      isOpen={isOpen}
      showBanner={showBanner}
      isAtTop={isAtTop}
      isNavVisible={true} // NavBar is forced visible when this modal is open
      onClose={handleClose}
      productName={productDetails?.productName}
      productSubtitle={productDetails?.productSubtitle}
      productImage={productDetails?.productImage}
      volumeDisplay={productDetails?.volumeDisplay}
      price={productDetails?.price}
      isMaxQuantityExceeded={addedProduct?.isMaxQuantityExceeded}
    />
  )
}
