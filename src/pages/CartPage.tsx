import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryCharge,
    deliveryCity,
    setDeliveryCity,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    totalAmount,
  } = useCart();
  const { addToast, settings } = useStore();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      addToast('success', res.message);
      setCouponInput('');
    } else {
      addToast('error', res.message);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-8">
          You haven't added any products to your cart yet. Discover smartphones, luxury sarees, panjabis and appliances now.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-8 py-3 rounded-xl transition shadow-lg shadow-emerald-600/30 inline-flex items-center gap-2"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-gray-500 mt-0.5">{cart.length} unique products in your bag</p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-bold transition flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-2xs divide-y divide-gray-100 overflow-hidden">
          {cart.map((item) => {
            const itemPrice = item.product.discountPrice ?? item.product.price;
            const lineTotal = itemPrice * item.quantity;

            return (
              <div key={item.product.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                    {item.product.category}
                  </div>
                  <h3
                    onClick={() => onNavigate(`product-${item.product.id}`)}
                    className="text-sm font-bold text-gray-900 hover:text-emerald-600 cursor-pointer transition line-clamp-2"
                  >
                    {item.product.name}
                  </h3>
                  <div className="text-xs text-gray-400 mt-1">
                    Unit Price: <span className="font-semibold text-gray-700">৳{itemPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1.5 text-gray-500 hover:text-gray-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1.5 text-gray-500 hover:text-gray-900"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-emerald-950">
                      ৳{lineTotal.toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-gray-300 hover:text-rose-500 p-1 transition"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="p-4 sm:p-5 bg-gray-50/60 flex items-center justify-between">
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-bold text-gray-700 hover:text-emerald-600 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
            <span className="text-xs text-gray-400">
              Subtotal: <strong>৳{subtotal.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Order Summary & Checkout Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-5 space-y-5">
            <h2 className="text-base font-extrabold text-gray-900">Order Summary</h2>

            {/* Free Delivery Banner */}
            {settings.isFreeDeliveryEnabled && settings.freeDeliveryThreshold && (
              <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3">
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

            {/* Destination Selector for Accurate Delivery Fee */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Delivery Destination</span>
              </label>
              <select
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
                className="w-full text-xs font-medium p-2 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:border-emerald-500"
              >
                <option value="Dhaka">ঢাকার ভেতরে (Inside Dhaka - ৳{settings.deliveryFeeInsideDhaka ?? 60})</option>
                <option value="Chattogram">চট্টগ্রাম বিভাগ (Chattogram - ৳{settings.deliveryFeeChittagong ?? settings.deliveryFeeOutsideDhaka ?? 120})</option>
                <option value="Sylhet">সিলেট বিভাগ (Sylhet - ৳{settings.deliveryFeeSylhet ?? settings.deliveryFeeOutsideDhaka ?? 120})</option>
                <option value="Rajshahi">রাজশাহী বিভাগ (Rajshahi - ৳{settings.deliveryFeeRajshahi ?? settings.deliveryFeeOutsideDhaka ?? 120})</option>
                <option value="Khulna">খুলনা বিভাগ (Khulna - ৳{settings.deliveryFeeKhulna ?? settings.deliveryFeeOutsideDhaka ?? 120})</option>
                <option value="Barishal">বরিশাল বিভাগ (Barishal - ৳{settings.deliveryFeeBarisal ?? settings.deliveryFeeOutsideDhaka ?? 120})</option>
                <option value="Rangpur">রংপুর বিভাগ (Rangpur - ৳{settings.deliveryFeeRangpur ?? settings.deliveryFeeOutsideDhaka ?? 120})</option>
                <option value="Mymensingh">ময়মনসিংহ বিভাগ (Mymensingh - ৳{settings.deliveryFeeMymensingh ?? settings.deliveryFeeOutsideDhaka ?? 120})</option>
                <option value="Outside Dhaka">ঢাকার বাহিরে অন্যান্য জেলা (৳{settings.deliveryFeeOutsideDhaka ?? 120})</option>
              </select>
            </div>

            {/* Promo Voucher Form */}
            <form onSubmit={handleApplyCoupon} className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                <span>Have a Promo Coupon?</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SOHOJBD or EID2026"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 text-xs p-2 bg-gray-50 border border-gray-200 rounded-xl uppercase outline-hidden focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs px-4 rounded-xl transition"
                >
                  Apply
                </button>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <span>Applied: <strong>{appliedCoupon}</strong> (-৳{discount.toLocaleString()})</span>
                  <button onClick={removeCoupon} className="text-emerald-700 font-bold hover:underline">
                    Remove
                  </button>
                </div>
              )}
            </form>

            {/* Cost Breakdown */}
            <div className="space-y-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">৳{subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount Applied</span>
                  <span>-৳{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold text-gray-900">
                  {deliveryCharge === 0 && settings.isFreeDeliveryEnabled ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `৳${deliveryCharge}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Payable</span>
                <span className="text-lg text-emerald-700">৳{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('checkout')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cash on Delivery Available • Verified Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
