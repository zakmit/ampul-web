import { describe, test, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ShoppingBagProvider, useShoppingBag } from '../ShoppingBagProvider'


describe('addItem', () => {
  test("can't add more when there're already 10", () => {
    const { result } = renderHook(() => useShoppingBag(), {
      wrapper: ShoppingBagProvider,
    })
    act(() => {
      result.current.addItem('product-1', 1, 10)
      result.current.addItem('product-1', 1, 1)
    })
    expect(result.current.addedProduct?.isMaxQuantityExceeded).toBe(true);
  })
  test("items should clamps quantity at 10", () => {
    const { result } = renderHook(() => useShoppingBag(), {
      wrapper: ShoppingBagProvider,
    })
    act(() => {
      result.current.addItem('product-1', 1, 10)
      result.current.addItem('product-1', 1, 1)
    })
    expect(result.current.items[0].quantity).toBe(10);
  })
})
describe('updateQuantity', () => {
  test("item should be remove when quantity change to zero", () => {
    const { result } = renderHook(() => useShoppingBag(), {
      wrapper: ShoppingBagProvider,
    })
    act(() => {
      result.current.addItem('product-1', 1, 1)
      result.current.updateQuantity('product-1', 1, 0)
    })
    expect(result.current.items.length).toBe(0);
  })
  test("should clamps at 10", () => {
    const { result } = renderHook(() => useShoppingBag(), {
      wrapper: ShoppingBagProvider,
    })
    act(() => {
      result.current.addItem('product-1', 1, 1)
      result.current.updateQuantity('product-1', 1, 15)
    })
    expect(result.current.items[0].quantity).toBe(10);
  })
})