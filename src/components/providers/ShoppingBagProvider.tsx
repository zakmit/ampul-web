'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react'

// Minimal data stored in localStorage - only IDs
export interface ShoppingBagItem {
  productId: string
  volumeId: number
  quantity: number
}

export interface ShoppingBagData {
  items: ShoppingBagItem[]
  selectedSample: string | null
}

export interface AddedProductInfo {
  productId: string
  volumeId: number
  isMaxQuantityExceeded?: boolean
}

interface ShoppingBagContextType {
  items: ShoppingBagItem[]
  selectedSample: string | null
  addedProduct: AddedProductInfo | null
  forceNavVisible: boolean
  addItem: (productId: string, volumeId: number, quantity?: number) => void
  removeItem: (productId: string, volumeId: number) => void
  updateQuantity: (productId: string, volumeId: number, quantity: number) => void
  setSelectedSample: (productSlug: string | null) => void
  clearAddedProduct: () => void
  clearBag: () => void
  setForceNavVisible: (visible: boolean) => void
  totalItems: number
}

const ShoppingBagContext = createContext<ShoppingBagContextType | undefined>(undefined)

const STORAGE_KEY = 'ampul-shopping-bag'

export function ShoppingBagProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShoppingBagItem[]>([])
  const [selectedSample, setSelectedSampleState] = useState<string | null>(null)
  const [addedProduct, setAddedProduct] = useState<AddedProductInfo | null>(null)
  const [forceNavVisible, setForceNavVisible] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data: ShoppingBagData = JSON.parse(stored)
        setItems(data.items || [])
        setSelectedSampleState(data.selectedSample || null)
      }
    } catch (error) {
      console.error('Failed to load shopping bag from localStorage:', error)
    }
    setIsInitialized(true)
  }, [])

  // Save to localStorage whenever items or selectedSample change (but only after initial load)
  useEffect(() => {
    if (isInitialized) {
      try {
        const data: ShoppingBagData = {
          items,
          selectedSample,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch (error) {
        console.error('Failed to save shopping bag to localStorage:', error)
      }
    }
  }, [items, selectedSample, isInitialized])

  const addItem = useCallback((productId: string, volumeId: number, quantity = 1) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (i) => i.productId === productId && i.volumeId === volumeId
      )

      if (existingItemIndex > -1) {
        // Item exists, check if adding would exceed maximum
        const updatedItems = [...prevItems]
        const potentialNewQuantity = updatedItems[existingItemIndex].quantity + quantity
        const isMaxExceeded = potentialNewQuantity > 10
        const newQuantity = Math.min(10, potentialNewQuantity)
        updatedItems[existingItemIndex].quantity = newQuantity

        // Trigger AddedToBagModal with error state if max exceeded
        setAddedProduct({ productId, volumeId, isMaxQuantityExceeded: isMaxExceeded })

        return updatedItems
      } else {
        // New item, add to bag (clamped to maximum of 10)
        const isMaxExceeded = quantity > 10
        setAddedProduct({ productId, volumeId, isMaxQuantityExceeded: isMaxExceeded })

        return [...prevItems, { productId, volumeId, quantity: Math.min(10, quantity) }]
      }
    })
  }, [])

  const removeItem = useCallback((productId: string, volumeId: number) => {
    setItems((prevItems) =>
      prevItems.filter((item) => !(item.productId === productId && item.volumeId === volumeId))
    )
  }, [])

  const updateQuantity = useCallback((productId: string, volumeId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, volumeId)
      return
    }

    // Clamp quantity to maximum of 10
    const clampedQuantity = Math.min(10, quantity)

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId && item.volumeId === volumeId
          ? { ...item, quantity: clampedQuantity }
          : item
      )
    )
  }, [removeItem])

  const setSelectedSample = useCallback((productSlug: string | null) => {
    setSelectedSampleState(productSlug)
  }, [])

  const clearAddedProduct = useCallback(() => {
    setAddedProduct(null)
  }, [])

  const clearBag = useCallback(() => {
    setItems([])
    setSelectedSampleState(null)
  }, [])

  const setForceNavVisibleCallback = useCallback((visible: boolean) => {
    setForceNavVisible(visible)
  }, [])

  const totalItems = useMemo(() =>
    items.reduce((sum, item) => sum + item.quantity, 0)
  , [items])

  const value = useMemo(() => ({
    items,
    selectedSample,
    addedProduct,
    forceNavVisible,
    addItem,
    removeItem,
    updateQuantity,
    setSelectedSample,
    clearAddedProduct,
    clearBag,
    setForceNavVisible: setForceNavVisibleCallback,
    totalItems,
  }), [items, selectedSample, addedProduct, forceNavVisible, addItem, removeItem, updateQuantity, setSelectedSample, clearAddedProduct, clearBag, setForceNavVisibleCallback, totalItems])

  return (
    <ShoppingBagContext.Provider value={value}>
      {children}
    </ShoppingBagContext.Provider>
  )
}

export function useShoppingBag() {
  const context = useContext(ShoppingBagContext)
  if (context === undefined) {
    throw new Error('useShoppingBag must be used within a ShoppingBagProvider')
  }
  return context
}
