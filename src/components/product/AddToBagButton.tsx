'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useShoppingBag } from '@/components/providers/ShoppingBagProvider'
import { getProductInventory } from '@/app/actions/inventory'
import type { Locale } from '@/i18n/config'

interface AddToBagButtonProps {
  productId: string
  volumeId: number
  label: string | React.ReactNode
  className?: string
  initialStock?: number
  showInventory?: boolean
}

export default function AddToBagButton({
  productId,
  volumeId,
  label,
  className = '',
  initialStock,
  showInventory = false,
}: AddToBagButtonProps) {
  const { addItem } = useShoppingBag()
  const locale = useLocale() as Locale
  const t = useTranslations('ProductDetail')
  const [isAdding, setIsAdding] = useState(false)
  const [stock, setStock] = useState(initialStock ?? 1)
  const [inventoryCheckFailed, setInventoryCheckFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    void getProductInventory(productId, volumeId, locale)
      .then((availability) => {
        if (!cancelled) {
          setStock(availability.stock)
          setInventoryCheckFailed(false)
        }
      })
      .catch(() => {
        if (!cancelled) setInventoryCheckFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [locale, productId, volumeId])

  const inventoryMessage = (() => {
    if (inventoryCheckFailed) return t('inventory.checkFailed')
    if (stock === 0) return t('inventory.outOfStock')
    if (stock <= 10) return t('inventory.lowStock', { count: stock })
    return t('inventory.inStock')
  })()
  const isBlocked = stock === 0 || (showInventory && inventoryCheckFailed)

  const handleAddToBag = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Prevent rapid double-clicks
    if (isAdding) return

    setIsAdding(true)
    try {
      const availability = await getProductInventory(productId, volumeId, locale)
      setStock(availability.stock)
      setInventoryCheckFailed(false)
      if (availability.canPurchase) addItem(productId, volumeId, 1)
    } catch {
      setInventoryCheckFailed(true)
    } finally {
      setIsAdding(false)
    }
  }

  // Replace bg-gray-700 and hover:bg-gray-900 with bg-gray-300 when disabled
  const getButtonClassName = () => {
    if (isAdding || isBlocked) {
      return className
        .replace('bg-gray-700', 'bg-gray-300')
        .replace('hover:bg-gray-900', '')
        .replace('cursor-pointer', 'cursor-not-allowed')
    }
    return className
  }

  const button = (
    <button type="button" onClick={handleAddToBag} disabled={isAdding || isBlocked} className={getButtonClassName()}>
      {stock === 0 ? t('inventory.outOfStock') : label}
    </button>
  )

  if (!showInventory) return button
// TODO: add a vertical assign version, can be controlled by send in prop
  return (
    <div className="flex gap-4 lg:gap-8 items-center">
      {button}
      <p className="text-center text-sm text-gray-700 italic" aria-live="polite">{inventoryMessage}</p>
    </div>
  )
}
