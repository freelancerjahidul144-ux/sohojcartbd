import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../types';
import { useStore } from './StoreContext';
import { getDistrictDeliveryFee } from '../data/districts';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, openDrawer?: boolean, selectedColor?: string) => void;
  buyNow: (product: Product, quantity?: number, selectedColor?: string) => void;
  selectSingleItemForCheckout: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  deliveryCharge: number;
  deliveryCity: string;
  setDeliveryCity: (city: string) => void;
  discount: number;
  couponCode: string;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  totalAmount: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'sohoj_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useStore();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [deliveryCity, setDeliveryCity] = useState<string>('Dhaka');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    openDrawer: boolean = true,
    selectedColor?: string
  ) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedColor === selectedColor
      );
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock || 99);
        return prev.map((item) =>
          item.product.id === product.id && item.selectedColor === selectedColor
            ? { ...item, quantity: newQty }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: Math.min(quantity, product.stock || 99),
          selectedColor,
        },
      ];
    });
    if (openDrawer) {
      setIsCartDrawerOpen(true);
    }
  };

  // Buy Now: Selects only this single product for instant checkout as requested by the user
  const buyNow = (product: Product, quantity: number = 1, selectedColor?: string) => {
    const singleItem: CartItem = {
      product,
      quantity: Math.min(Math.max(1, quantity), product.stock || 99),
      selectedColor,
    };
    setCart([singleItem]);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([singleItem]));
    } catch {}
  };

  // If customer wants to order only one single item from their list
  const selectSingleItemForCheckout = (productId: string) => {
    setCart((prev) => {
      const match = prev.find((item) => item.product.id === productId);
      if (match) {
        try {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([match]));
        } catch {}
        return [match];
      }
      return prev.slice(0, 1);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock || 99;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cart.reduce((acc, item) => {
    const itemPrice = item.product.discountPrice ?? item.product.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  // Delivery Charge calculation for Bangladesh:
  // Dynamically calculated using district, division, admin settings, and free threshold
  const deliveryCharge =
    cart.length === 0
      ? 0
      : getDistrictDeliveryFee(deliveryCity, settings, subtotal);

  // Coupon discount calculation
  let discount = 0;
  if (appliedCoupon === 'SOHOJBD') {
    discount = Math.round(subtotal * 0.1); // 10% OFF
  } else if (appliedCoupon === 'EID2026') {
    discount = subtotal >= 3000 ? 500 : 250;
  } else if (appliedCoupon === 'WELCOME') {
    discount = Math.min(100, subtotal);
  }

  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === 'SOHOJBD') {
      setAppliedCoupon('SOHOJBD');
      setCouponCode('SOHOJBD');
      return { success: true, message: 'Coupon SOHOJBD applied! You saved 10%.' };
    }
    if (trimmed === 'EID2026') {
      setAppliedCoupon('EID2026');
      setCouponCode('EID2026');
      return { success: true, message: 'Eid festive coupon applied!' };
    }
    if (trimmed === 'WELCOME') {
      setAppliedCoupon('WELCOME');
      setCouponCode('WELCOME');
      return { success: true, message: 'Welcome voucher applied: ৳100 discount!' };
    }
    return { success: false, message: 'Invalid or expired coupon code. Try SOHOJBD' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const totalAmount = Math.max(0, subtotal - discount + deliveryCharge);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        buyNow,
        selectSingleItemForCheckout,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        deliveryCharge,
        deliveryCity,
        setDeliveryCity,
        discount,
        couponCode,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        totalAmount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
