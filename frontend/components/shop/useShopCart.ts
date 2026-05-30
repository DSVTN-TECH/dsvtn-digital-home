'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CartItem } from '@/components/forms/OrderForm'
import type { Product } from '@/lib/datasource/shop'

const CART_KEY = 'dsvtn_shop_cart'

export function useShopCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    const raw = window.localStorage.getItem(CART_KEY)
    if (raw) setCart(JSON.parse(raw) as CartItem[])
  }, [])

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.max(1, item.quantity + quantity) }
            : item,
        )
      }
      return [...prev, { product, quantity: Math.max(1, quantity) }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    )
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  return { cart, addToCart, updateQuantity, removeFromCart, clearCart }
}
