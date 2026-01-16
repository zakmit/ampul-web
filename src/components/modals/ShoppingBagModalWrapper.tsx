'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useShoppingBag } from '@/components/providers/ShoppingBagProvider'
import { getShoppingBagItems, getAvailableProductsForSample, type ShoppingBagItemDetails } from '@/app/actions/shoppingBag'
import ShoppingBagModal from './ShoppingBagModal'
import type { Locale } from '@/i18n/config'

interface ShoppingBagModalWrapperProps {
  isOpen: boolean
  showBanner: boolean
  isAtTop: boolean
  isNavVisible: boolean
  onClose: () => void
}

export default function ShoppingBagModalWrapper({
  isOpen,
  showBanner,
  isAtTop,
  isNavVisible,
  onClose,
}: ShoppingBagModalWrapperProps) {
  const locale = useLocale() as Locale
  const { items, selectedSample, updateQuantity, removeItem, setSelectedSample } = useShoppingBag()
  const [bagItemDetails, setBagItemDetails] = useState<ShoppingBagItemDetails[]>([])
  const [availableProducts, setAvailableProducts] = useState<Array<{ value: string; label: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch bag item details when items change or modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      Promise.all([
        getShoppingBagItems(items, locale),
        getAvailableProductsForSample(locale),
      ])
        .then(([bagItems, products]) => {
          setBagItemDetails(bagItems)
          setAvailableProducts(products)

          // Set default sample to first product if none selected
          if (!selectedSample && products.length > 0) {
            setSelectedSample(products[0].value)
          }
        })
        .catch((error) => {
          console.error('Failed to fetch shopping bag data:', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, items, locale])

  const handleQuantityChange = (productId: string, volumeId: number, delta: number) => {
    const item = bagItemDetails.find((i) => i.productId === productId && i.volumeId === volumeId)
    if (item) {
      const newQuantity = Math.max(1, Math.min(10, item.quantity + delta))
      updateQuantity(productId, volumeId, newQuantity)
    }
  }

  const handleQuantitySet = (productId: string, volumeId: number, quantity: number) => {
    const clampedQuantity = Math.max(1, Math.min(10, quantity))
    updateQuantity(productId, volumeId, clampedQuantity)
  }

  const handleRemoveItem = (productId: string, volumeId: number) => {
    removeItem(productId, volumeId)
  }

  const handleSampleChange = (productSlug: string | null) => {
    setSelectedSample(productSlug)
  }

  return (
    <ShoppingBagModal
      isOpen={isOpen}
      showBanner={showBanner}
      isAtTop={isAtTop}
      isNavVisible={isNavVisible}
      onClose={onClose}
      items={bagItemDetails}
      availableProducts={availableProducts}
      selectedSample={selectedSample}
      isLoading={isLoading}
      onQuantityChange={handleQuantityChange}
      onQuantitySet={handleQuantitySet}
      onRemoveItem={handleRemoveItem}
      onSampleChange={handleSampleChange}
    />
  )
}
