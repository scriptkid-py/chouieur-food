'use client';

import type { CartItem, MenuItem, Supplement } from '@/lib/types';
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: MenuItem; size: 'Normal' | 'Mega' } }
  | { type: 'REMOVE_ITEM'; payload: { cartId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { cartId: string; quantity: number } }
  | { type: 'UPDATE_SIZE'; payload: { cartId: string; size: 'Normal' | 'Mega' } }
  | { type: 'TOGGLE_SUPPLEMENT'; payload: { cartId: string; supplement: Supplement } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
};

const calculateItemTotal = (item: CartItem): number => {
  const basePrice = item.size === 'Mega' && item.menuItem.megaPrice ? item.menuItem.megaPrice : item.menuItem.price;
  const supplementsPrice = item.supplements.reduce((total, sup) => total + sup.price, 0);
  return (basePrice + supplementsPrice) * item.quantity;
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  console.log('🔄 Cart reducer called with action:', action.type);
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, size } = action.payload;
      console.log('📝 Creating new cart item:', item.name);
      const newItem: CartItem = {
        cartId: `${item.id}-${size}-${Date.now()}`,
        menuItem: item,
        quantity: 1,
        size,
        supplements: [],
        totalPrice: 0,
      };
      newItem.totalPrice = calculateItemTotal(newItem);
      const newState = { ...state, items: [...state.items, newItem] };
      console.log('🛒 New cart state:', newState.items.length, 'items');
      return newState;
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.cartId !== action.payload.cartId),
      };
    case 'UPDATE_QUANTITY': {
      return {
        ...state,
        items: state.items.map(item => {
          if (item.cartId === action.payload.cartId) {
            const updatedItem = { ...item, quantity: action.payload.quantity };
            return { ...updatedItem, totalPrice: calculateItemTotal(updatedItem) };
          }
          return item;
        }).filter(item => item.quantity > 0),
      };
    }
    case 'UPDATE_SIZE': {
        return {
            ...state,
            items: state.items.map(item => {
                if (item.cartId === action.payload.cartId) {
                    const updatedItem = { ...item, size: action.payload.size };
                    return { ...updatedItem, totalPrice: calculateItemTotal(updatedItem) };
                }
                return item;
            }),
        };
    }
    case 'TOGGLE_SUPPLEMENT': {
      return {
        ...state,
        items: state.items.map(item => {
          if (item.cartId === action.payload.cartId) {
            const { supplement } = action.payload;
            const supplements = item.supplements.some(s => s.id === supplement.id)
              ? item.supplements.filter(s => s.id !== supplement.id)
              : [...item.supplements, supplement];
            const updatedItem = { ...item, supplements };
            return { ...updatedItem, totalPrice: calculateItemTotal(updatedItem) };
          }
          return item;
        }),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

type CartContextType = {
  cartItems: CartItem[];
  addItem: (item: MenuItem, size?: 'Normal' | 'Mega') => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  updateSize: (cartId: string, size: 'Normal' | 'Mega') => void;
  toggleSupplement: (cartId: string, supplement: Supplement) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Load cart from localStorage on mount
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cart');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return initialState;
        }
      }
    }
    return initialState;
  });
  const { toast } = useToast();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('🛒 Cart updated:', state.items);
    console.log('📊 Total items:', state.items.length);
    console.log('📦 Items:', state.items);
    
    if (typeof window !== 'undefined') {
      try {
        // Stringify the entire state
        const dataToSave = JSON.stringify(state);
        localStorage.setItem('cart', dataToSave);
        console.log('💾 Saved to localStorage:', dataToSave.substring(0, 100) + '...');
      } catch (e) {
        console.error('❌ Failed to save to localStorage:', e);
      }
    }
  }, [state]);

  const addItem = (item: MenuItem, size: 'Normal' | 'Mega' = 'Normal') => {
    console.log('🛒 Adding item to cart:', item);
    console.log('📦 Item details:', { name: item.name, id: item.id, price: item.price, size });
    dispatch({ type: 'ADD_ITEM', payload: { item, size } });
    console.log('✅ Dispatch sent');
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const removeItem = (cartId: string) => dispatch({ type: 'REMOVE_ITEM', payload: { cartId } });
  const updateQuantity = (cartId: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { cartId, quantity } });
  const updateSize = (cartId: string, size: 'Normal' | 'Mega') => dispatch({ type: 'UPDATE_SIZE', payload: { cartId, size } });
  const toggleSupplement = (cartId: string, supplement: Supplement) => dispatch({ type: 'TOGGLE_SUPPLEMENT', payload: { cartId, supplement } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const cartTotal = state.items.reduce((total, item) => total + item.totalPrice, 0);
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems: state.items, addItem, removeItem, updateQuantity, updateSize, toggleSupplement, clearCart, cartTotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
