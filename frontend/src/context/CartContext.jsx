import { createContext, useContext, useState, useCallback } from 'react'
import { cartApi } from '../lib/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await cartApi.get()
      setCart(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [user])

  const addItem = async (productId, quantity = 1) => {
    await cartApi.add(productId, quantity)
    await fetchCart()
  }

  const removeItem = async (productId) => {
    await cartApi.remove(productId)
    await fetchCart()
  }

  const clearCart = async () => {
    await cartApi.clear()
    setCart(null)
  }

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0
  const total = cart?.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addItem, removeItem, clearCart, itemCount, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
