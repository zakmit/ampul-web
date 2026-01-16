'use client'

import { useState } from 'react'
import { useShoppingBag } from '@/components/providers/ShoppingBagProvider'

interface AddToBagButtonProps {
  productId: string
  volumeId: number
  label: string | React.ReactNode
  className?: string
}

export default function AddToBagButton({
  productId,
  volumeId,
  label,
  className = '',
}: AddToBagButtonProps) {
  const { addItem } = useShoppingBag()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToBag = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Prevent rapid double-clicks
    if (isAdding) return

    setIsAdding(true)
    addItem(productId, volumeId, 1)

    // Reset the flag after 3 seconds (matching modal auto-dismiss)
    setTimeout(() => {
      setIsAdding(false)
    }, 3000)
  }

  // Replace bg-gray-700 and hover:bg-gray-900 with bg-gray-300 when disabled
  const getButtonClassName = () => {
    if (isAdding) {
      return className
        .replace('bg-gray-700', 'bg-gray-300')
        .replace('hover:bg-gray-900', '')
        .replace('cursor-pointer', 'cursor-not-allowed')
    }
    return className
  }

  return (
    <button
      type="button"
      onClick={handleAddToBag}
      disabled={isAdding}
      className={getButtonClassName()}
    >
      {label}
    </button>
  )
}
