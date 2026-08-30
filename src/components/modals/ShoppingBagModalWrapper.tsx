'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useShoppingBag } from '@/components/providers/ShoppingBagProvider'
import { getShoppingBagItems, getAvailableProductsForSample, type SampleOption, type ShoppingBagItemDetails } from '@/app/actions/shoppingBag'
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
  const [availableProducts, setAvailableProducts] = useState<SampleOption[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch bag item details when items change or modal opens
  useEffect(() => {
    let cancelled = false
    if (isOpen) {
      setIsLoading(true)
      Promise.all([
        getShoppingBagItems(items, locale),
        getAvailableProductsForSample(locale),
      ])
        .then(([bagItems, products]) => {
          if (cancelled) return
          setBagItemDetails(bagItems)
          setAvailableProducts(products)

          const selectedOption = products.find((product) => product.value === selectedSample)
          if (selectedOption?.disabled) {
            setSelectedSample(null)
          } else if (!selectedSample) {
            setSelectedSample(products.find((product) => !product.disabled)?.value ?? null)
          }
        })
        .catch((error) => {
          if (cancelled) return
          console.error('Failed to fetch shopping bag data:', error)
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    }
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, items, locale])

  const handleQuantityChange = (productId: string, volumeId: number, delta: number) => {
    const item = bagItemDetails.find((i) => i.productId === productId && i.volumeId === volumeId)
    if (item && item.stock > 0) {
      const newQuantity = Math.max(1, Math.min(10, item.stock, item.quantity + delta))
      updateQuantity(productId, volumeId, newQuantity)
    }
  }

  const handleQuantitySet = (productId: string, volumeId: number, quantity: number) => {
    const item = bagItemDetails.find((entry) => entry.productId === productId && entry.volumeId === volumeId)
    if (!item || item.stock < 1) return
    const clampedQuantity = Math.max(1, Math.min(10, item.stock, quantity))
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
