import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

interface CartDrawerProps {
  onNavigate: (page: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    deliveryCharge,
    totalAmount,
    couponCode,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discount,
  } = useCart();
  const { addToast, settings } = useStore();

  const [inputCoupon, setInputCoupon] = useState('');

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    if (res.success) {
      addToast('success', res.message);
      setInputCoupon('');
    } else {
      addToast('error', res.message);
    }
  };

  const handleCheckoutClick = () => {
    setIsCartDrawerOpen(false);
    onNavigate('checkout');
  };

  const handleViewCartClick = () => {
    setIsCartDrawerOpen(false);
    onNavigate('cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h2 className="font-extrabold text-base tracking-tight">Your Shopping Cart</h2>
              <span className="bg-emerald-800 text-emerald-200 text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Offer Banner */}
          {settings.isFreeDeliveryEnabled && settings.freeDeliveryThreshold && cart.length > 0 && (
            <div className="bg-amber-50/90 border-b border-amber-200 p-2.5 px-4">
              {subtotal >= settings.freeDeliveryThreshold ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-extrabold">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>🎉 অভিনন্দন! আপনার অর্ডারে সম্পূর্ণ ফ্রি ডেলিভারি প্রযোজ্য!</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-800 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        আর মাত্র <strong>{settings.currencySymbol || '৳'}{(settings.freeDeliveryThreshold - subtotal).toLocaleString()}</strong> টাকার অর্ডারে ফ্রি ডেলিভারি!
                      </span>
                    </span>
                    <span className="text-[11px] text-amber-900 font-black">
                      {Math.round((subtotal / settings.freeDeliveryThreshold) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-amber-200/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.round((subtotal / settings.freeDeliveryThreshold) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-gray-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-extrabold text-gray-800 text-lg mb-1">Your cart is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mb-6">
                  Explore our collection of authentic smartphones, traditional attire and top appliances.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    onNavigate('products');
                  }}
                  className="bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemPrice = item.product.discountPrice ?? item.product.price;
                return (
                  <div key={item.product.id} className="py-3.5 flex gap-3.5 items-center">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <div className="text-[11px] text-gray-500 mb-1 flex items-center gap-1.5 flex-wrap">
                        <span>{item.product.category}</span>
                        {item.selectedColor && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                            কালার: {item.selectedColor}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-700">
                          ৳{itemPrice.toLocaleString()}
                        </span>

                        {/* Quantity selector */}
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-gray-500 hover:text-gray-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-gray-300 hover:text-rose-500 transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Calculations */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 p-4 sm:p-5 bg-gray-50/70 space-y-3">
              {/* Promo Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. SOHOJBD)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg uppercase placeholder:normal-case outline-hidden focus:border-emerald-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-emerald-100/70 text-emerald-800 px-3 py-1 rounded-lg">
                  <span>Coupon: <strong>{appliedCoupon}</strong> (-৳{discount.toLocaleString()})</span>
                  <button onClick={removeCoupon} className="text-emerald-700 hover:text-emerald-950 font-bold ml-2">
                    Remove
                  </button>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">৳{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>
                    ডেলিভারি চার্জ ({deliveryCharge === 0 && settings.isFreeDeliveryEnabled ? 'ফ্রি' : `ঢাকার ভেতরে ৳${settings.deliveryFeeInsideDhaka ?? 60} / বাহিরে ৳${settings.deliveryFeeOutsideDhaka ?? 120}`})
                  </span>
                  <span className="font-bold text-gray-900">
                    {deliveryCharge === 0 && settings.isFreeDeliveryEnabled ? (
                      <span className="text-emerald-700 font-extrabold">FREE (৳০)</span>
                    ) : (
                      `৳${deliveryCharge}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Estimated Total</span>
                  <span className="text-base text-emerald-700">৳{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleViewCartClick}
                  className="py-2.5 px-3 border border-gray-300 hover:bg-white text-gray-800 text-xs font-bold rounded-xl transition text-center"
                >
                  View Cart
                </button>
                <button
                  onClick={handleCheckoutClick}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 text-center"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Safe & Secure Checkout • Cash on Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
