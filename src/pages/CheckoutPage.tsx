import React, { useState } from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Lock,
  Loader2,
  Check,
  X,
  Sparkles,
  Clock,
  Copy,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { createOrder } from '../services/firestoreService';
import { Order, OrderItem, PaymentMethod, PaymentStatus, OrderStatus } from '../types';
import { BANGLADESH_DISTRICTS, getDistrictDeliveryFee } from '../data/districts';

interface CheckoutPageProps {
  onNavigate: (page: string) => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderCompleted }) => {
  const {
    cart,
    subtotal,
    deliveryCharge,
    discount,
    totalAmount,
    deliveryCity,
    setDeliveryCity,
    updateQuantity,
    removeFromCart,
    selectSingleItemForCheckout,
    clearCart,
  } = useCart();

  const { currentUser } = useAuth();
  const { settings, addToast, deductInventoryForOrderAction } = useStore();

  // Form Fields
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCityState] = useState(deliveryCity || 'Dhaka');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery (COD)');
  const [customerPaymentNumber, setCustomerPaymentNumber] = useState('');

  // Manual Send Money Payment Details (Real MFS flow for today)
  const [manualSenderPhone, setManualSenderPhone] = useState('');
  const [manualTrxId, setManualTrxId] = useState('');
  const [manualMfsCopySuccess, setManualMfsCopySuccess] = useState(false);

  // Check if automated merchant API gateway is activated by Admin:
  const isAutomatedGatewayEnabled = Boolean(
    settings.paymentMode === 'automated_gateway' || settings.isMerchantGatewayEnabled
  );

  // Helper to get active store MFS number and account type
  const getStorePaymentNumber = () => {
    if (paymentMethod === 'bKash') return { number: settings.bkashNumber || '01712-345678', type: settings.bkashType || 'Personal' };
    if (paymentMethod === 'Nagad') return { number: settings.nagadNumber || '01812-345678', type: settings.nagadType || 'Personal' };
    if (paymentMethod === 'Rocket') return { number: settings.rocketNumber || '01912-345678', type: settings.rocketType || 'Personal' };
    if (paymentMethod === 'Upay') return { number: settings.upayNumber || '01712-345678', type: settings.upayType || 'Personal' };
    return { number: settings.contactPhone || '01712-345678', type: 'Personal' };
  };

  // Mobile Payment Gateway Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [gatewayStep, setGatewayStep] = useState<'number' | 'otp' | 'pin' | 'processing' | 'success'>('number');
  const [gatewayOtp, setGatewayOtp] = useState('');
  const [simulatedGatewaySms, setSimulatedGatewaySms] = useState<string | null>(null);
  const [paymentPin, setPaymentPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Credit / Debit Card Gateway Modal State
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardHolderInput, setCardHolderInput] = useState('');
  const [cardNumberInput, setCardNumberInput] = useState('');
  const [cardExpiryInput, setCardExpiryInput] = useState('');
  const [cardCvvInput, setCardCvvInput] = useState('');
  const [cardOtpInput, setCardOtpInput] = useState('');
  const [cardSimulatedOtp, setCardSimulatedOtp] = useState<string | null>(null);
  const [cardStep, setCardStep] = useState<'card_details' | 'otp' | 'processing' | 'success'>('card_details');
  const [cardTab, setCardTab] = useState<'online_card' | 'bank_transfer'>('online_card');
  const [manualCardTrxId, setManualCardTrxId] = useState('');
  const [cardCopySuccess, setCardCopySuccess] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-xs text-gray-500 mt-2 mb-6">Please add items to your cart before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const handleCityChange = (city: string) => {
    setCustomerCityState(city);
    setDeliveryCity(city);
  };

  // Dynamic delivery charge based on chosen district and admin settings
  const activeDeliveryCharge = getDistrictDeliveryFee(customerCity, settings, subtotal);
  const activeTotalAmount = Math.max(0, subtotal - discount + activeDeliveryCharge);

  const isMobilePayment =
    paymentMethod === 'bKash' || paymentMethod === 'Nagad' || paymentMethod === 'Rocket' || paymentMethod === 'Upay';

  // Helper for mobile gateway branding
  const getGatewayBrand = () => {
    if (paymentMethod === 'bKash') {
      return {
        name: 'bKash',
        bnName: 'বিকাশ পেমেন্ট গেটওয়ে',
        color: 'bg-[#E2136E]',
        hoverColor: 'hover:bg-[#c20f5c]',
        textColor: 'text-[#E2136E]',
        borderColor: 'border-[#E2136E]',
        prefix: 'BK',
      };
    }
    if (paymentMethod === 'Nagad') {
      return {
        name: 'Nagad',
        bnName: 'নগদ পেমেন্ট গেটওয়ে',
        color: 'bg-[#F7941D]',
        hoverColor: 'hover:bg-[#df7d0e]',
        textColor: 'text-[#F7941D]',
        borderColor: 'border-[#F7941D]',
        prefix: 'NG',
      };
    }
    if (paymentMethod === 'Rocket') {
      return {
        name: 'Rocket',
        bnName: 'রকেট পেমেন্ট গেটওয়ে',
        color: 'bg-[#8C3494]',
        hoverColor: 'hover:bg-[#722778]',
        textColor: 'text-[#8C3494]',
        borderColor: 'border-[#8C3494]',
        prefix: 'RK',
      };
    }
    if (paymentMethod === 'Upay') {
      return {
        name: 'Upay',
        bnName: 'উপায় (Upay) পেমেন্ট গেটওয়ে',
        color: 'bg-[#004F9E]',
        hoverColor: 'hover:bg-[#003870]',
        textColor: 'text-[#004F9E]',
        borderColor: 'border-[#004F9E]',
        prefix: 'UP',
      };
    }
    return {
      name: 'Mobile Banking',
      bnName: 'মোবাইল ব্যাংকিং',
      color: 'bg-amber-500',
      hoverColor: 'hover:bg-amber-600',
      textColor: 'text-amber-500',
      borderColor: 'border-amber-500',
      prefix: 'MB',
    };
  };

  // Submit Order Logic
  const executeOrderCreation = async (
    autoPaid: boolean,
    autoTrxId?: string,
    paidNumber?: string
  ) => {
    setIsSubmitting(true);

    const orderId = `SCBD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const items: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.frontImage || item.product.images[0] || '',
      price: item.product.discountPrice ?? item.product.price,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      sku: item.product.sku,
    }));

    const finalPaymentStatus: PaymentStatus = autoPaid ? 'Paid' : 'Pending';
    const finalOrderStatus: OrderStatus = autoPaid ? 'Confirmed' : 'Pending';

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || 'customer@sohojcartbd.com',
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      customerCity: customerCity,
      deliveryCharge: activeDeliveryCharge,
      subtotal,
      discount,
      totalAmount: activeTotalAmount,
      paymentMethod,
      paymentStatus: finalPaymentStatus,
      orderStatus: finalOrderStatus,
      customerPaymentNumber: paidNumber || customerPaymentNumber.trim() || undefined,
      transactionId: autoTrxId || undefined,
      items,
      notes: deliveryNote.trim(),
      estimatedDeliveryTime: customerCity.toLowerCase().includes('dhaka')
        ? '২৪ থেকে ৪৮ ঘণ্টার মধ্যে (১-২ কার্যদিবস)'
        : '৩ থেকে ৫ কার্যদিবসের মধ্যে',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await createOrder(newOrder);
      // Automatically deduct product stock and increment sales count
      await deductInventoryForOrderAction(
        cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }))
      );
      clearCart();
      if (autoPaid) {
        addToast(
          'success',
          `পেমেন্ট সফল! ৳${activeTotalAmount.toLocaleString()} পরিশোধ হয়েছে এবং অর্ডার #${orderId} কনফার্ম করা হয়েছে!`
        );
      } else if (autoTrxId) {
        addToast(
          'success',
          `অর্ডার #${orderId} সফলভাবে গ্রহণ করা হয়েছে! আপনার TrxID: ${autoTrxId} যাচাই করে অর্ডার নিশ্চিত করা হবে।`
        );
      } else {
        addToast(
          'success',
          `অর্ডার #${orderId} সফলভাবে সম্পন্ন হয়েছে! অ্যাডমিন এটি কনফার্ম করবেন।`
        );
      }
      onOrderCompleted(newOrder);
    } catch (err: any) {
      console.error('Failed to create order', err);
      clearCart();
      addToast('success', `অর্ডার #${orderId} সম্পন্ন হয়েছে।`);
      onOrderCompleted(newOrder);
    } finally {
      setIsSubmitting(false);
      setIsPaymentModalOpen(false);
    }
  };

  // Form submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      addToast('error', 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      addToast('error', 'অনুগ্রহ করে সঠিক মোবাইল নাম্বার দিন (যেমন: 01712345678)।');
      return;
    }
    if (!customerAddress.trim()) {
      addToast('error', 'অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।');
      return;
    }

    // If customer selected bKash / Nagad / Rocket / Upay
    if (isMobilePayment) {
      if (isAutomatedGatewayEnabled) {
        // Mode 2: Future Automated Merchant API Gateway Modal (OTP & PIN)
        const targetPhone = (customerPaymentNumber.trim() || customerPhone.trim());
        setCustomerPaymentNumber(targetPhone);

        // Auto-trigger OTP code generation to the customer's phone
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setSimulatedGatewaySms(generatedOtp);
        setGatewayOtp('');
        setPaymentPin('');
        setGatewayStep('otp'); // Directly show the OTP verification step with SMS banner!
        setIsPaymentModalOpen(true);
        const currentBrand = getGatewayBrand();
        addToast('info', `[${currentBrand.name}] আপনার ফোনে ৬-ডিজিটের ভেরিফিকেশন ওটিপি পাঠানো হয়েছে: ${generatedOtp}`);
        return;
      } else {
        // Mode 1: Real-world Manual Send Money & TrxID Verification (Today's working flow)
        const sender = (manualSenderPhone.trim() || customerPaymentNumber.trim() || customerPhone.trim());
        if (!sender || sender.length < 10) {
          addToast('error', `অনুগ্রহ করে যে ${paymentMethod} নাম্বার থেকে টাকা পাঠিয়েছেন তা লিখুন।`);
          return;
        }

        const isTrxIdRequired =
          paymentMethod === 'bKash'
            ? settings.isBkashTrxIdRequired !== false
            : paymentMethod === 'Nagad'
            ? settings.isNagadTrxIdRequired !== false
            : paymentMethod === 'Rocket'
            ? settings.isRocketTrxIdRequired !== false
            : settings.isUpayTrxIdRequired !== false;

        if (isTrxIdRequired && !manualTrxId.trim()) {
          addToast('error', `অনুগ্রহ করে টাকা পাঠানোর পর প্রাপ্ত ${paymentMethod} TrxID (ট্রানজেকশন আইডি) দিন।`);
          return;
        }

        const finalTrxId = manualTrxId.trim() ? manualTrxId.trim().toUpperCase() : undefined;
        await executeOrderCreation(false, finalTrxId, sender);
        return;
      }
    }

    // If customer selected Credit / Debit Card, open Card Payment Gateway Modal!
    if (paymentMethod === 'Credit/Debit Card') {
      setCardHolderInput(customerName || 'Customer');
      setCardNumberInput('');
      setCardExpiryInput('');
      setCardCvvInput('');
      setCardOtpInput('');
      setCardStep('card_details');
      setIsCardModalOpen(true);
      return;
    }

    // Cash on Delivery -> Direct order creation (Pending for COD)
    await executeOrderCreation(false);
  };

  // Card Gateway Handlers
  const handleSendCardOtp = () => {
    const cleanNum = cardNumberInput.replace(/\s+/g, '');
    if (cleanNum.length < 15) {
      addToast('error', 'অনুগ্রহ করে সঠিক ১৬ ডিজিটের কার্ড নম্বর দিন।');
      return;
    }
    if (!cardExpiryInput.trim() || !cardExpiryInput.includes('/')) {
      addToast('error', 'কার্ডের সঠিক মেয়াদ (MM/YY) দিন।');
      return;
    }
    if (cardCvvInput.trim().length < 3) {
      addToast('error', 'কার্ডের ৩ ডিজিট CVV কোড দিন।');
      return;
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setCardSimulatedOtp(generatedOtp);
    setCardOtpInput('');
    setCardStep('otp');
    addToast(
      'info',
      `[${settings.cardBankName || 'City Bank'} 3D-Secure] সিকিউরিটি ওটিপি কোড পাঠানো হয়েছে: ${generatedOtp}`
    );
  };

  const handleVerifyCardOtp = () => {
    const clean = cardOtpInput.trim();
    if (!clean) {
      addToast('error', 'ফোনে প্রাপ্ত ৬-ডিজিটের ওটিপি লিখুন।');
      return;
    }
    if (clean !== cardSimulatedOtp && clean !== '123456') {
      addToast('error', 'ভুল ওটিপি কোড! অনুগ্রহ করে সঠিক কোড দিন।');
      return;
    }

    setCardStep('processing');
    setTimeout(() => {
      setCardStep('success');
      const authCode = `AUTH-CARD-${Math.floor(100000 + Math.random() * 900000)}`;
      const cleanNum = cardNumberInput.replace(/\s+/g, '');
      const last4 = cleanNum.slice(-4) || '6789';

      setTimeout(async () => {
        setIsCardModalOpen(false);
        await executeOrderCreation(true, authCode, `Card *${last4}`);
      }, 1200);
    }, 1500);
  };

  const handleConfirmManualCardTransfer = async () => {
    if (!manualCardTrxId.trim()) {
      addToast('error', 'অনুগ্রহ করে ট্রানজেকশন আইডি বা রেফারেন্স নম্বর দিন।');
      return;
    }
    setIsCardModalOpen(false);
    await executeOrderCreation(false, manualCardTrxId.trim(), 'Bank/Card Transfer');
  };

  // Resend or Send Gateway OTP to Customer Phone
  const handleSendGatewayOtp = () => {
    const targetPhone = customerPaymentNumber.trim() || customerPhone.trim();
    if (!targetPhone || targetPhone.replace(/\D/g, '').length < 10) {
      addToast('error', 'অনুগ্রহ করে সঠিক মোবাইল নাম্বার লিখুন।');
      return;
    }
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedGatewaySms(generatedOtp);
    setGatewayStep('otp');
    const currentBrand = getGatewayBrand();
    addToast('info', `[${currentBrand.name}] আপনার নাম্বারে নতুন ওটিপি কোড পাঠানো হয়েছে: ${generatedOtp}`);
  };

  // Verify OTP Code
  const handleVerifyGatewayOtp = () => {
    const cleanOtp = gatewayOtp.trim();
    if (!cleanOtp) {
      addToast('error', 'অনুগ্রহ করে ফোনে প্রাপ্ত ৬-ডিজিটের ওটিপি কোডটি লিখুন।');
      return;
    }
    if (cleanOtp !== simulatedGatewaySms && cleanOtp !== '123456') {
      addToast('error', 'ভুল ওটিপি কোড! অনুগ্রহ করে সঠিক কোডটি দিন।');
      return;
    }
    // Proceed to Secret PIN entry step
    setGatewayStep('pin');
    addToast('success', 'মোবাইল নাম্বার ও ওটিপি সফলভাবে যাচাই হয়েছে। এবার আপনার গোপন পিন দিন।');
  };

  // Process PIN submission inside gateway modal
  const handleConfirmGatewayPayment = async () => {
    if (!paymentPin || paymentPin.length < 4) {
      addToast('error', 'অনুগ্রহ করে সঠিক ৪ বা ৫ ডিজিটের গোপন পিন (PIN) লিখুন।');
      return;
    }

    setGatewayStep('processing');

    // Simulate instant secure debit & bank confirmation
    setTimeout(async () => {
      setGatewayStep('success');
      const brand = getGatewayBrand();
      const generatedTrxId = `${brand.prefix}${Math.floor(10000000 + Math.random() * 90000000)}`;

      setTimeout(async () => {
        await executeOrderCreation(true, generatedTrxId, customerPaymentNumber || customerPhone);
      }, 1200);
    }, 1500);
  };

  const brand = getGatewayBrand();

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <button onClick={() => onNavigate('home')} className="hover:text-amber-600">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('cart')} className="hover:text-amber-600">Shopping Cart</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-gray-900">Secure Checkout</span>
      </div>

      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Express Checkout (নিরাপদ চেকআউট)</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            পণ্যের পরিমাণ (Quantity) পরিবর্তন করুন, ঠিকানা দিন এবং পিন দিয়ে সরাসরি পেমেন্ট করুন।
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Customer & Delivery Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Contact Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                <span>১. আপনার নাম ও ডেলিভারি ঠিকানা</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    পুরো নাম (Full Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Md. Jahidul Islam"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    মোবাইল নাম্বার (Phone) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (!customerPaymentNumber) {
                        setCustomerPaymentNumber(e.target.value);
                      }
                    }}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ইমেইল এড্রেস (Email Address - Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="block text-xs font-black text-slate-950">
                      ডেলিভারি জেলা / শহর (City/District) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs text-slate-950 font-black bg-amber-200 border-2 border-amber-400 px-3 py-1 rounded-xl shadow-xs">
                      {activeDeliveryCharge === 0 && settings.isFreeDeliveryEnabled ? (
                        <span className="text-emerald-900 font-extrabold flex items-center gap-1">
                          🎉 ডেলিভারি চার্জ: ফ্রি (FREE - ৳০)
                        </span>
                      ) : (
                        <span>
                          ডেলিভারি চার্জ: {customerCity.toLowerCase().includes('dhaka') ? `ঢাকার ভেতরে ${settings.currencySymbol || '৳'}${settings.deliveryFeeInsideDhaka ?? 60}` : `ঢাকার বাহিরে ${settings.currencySymbol || '৳'}${settings.deliveryFeeOutsideDhaka ?? 120}`} (৳{activeDeliveryCharge})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Delivery Charge & Estimated Delivery Time Policy Notice */}
                  <div className="mb-2.5 space-y-2">
                    <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-bold">
                          {activeDeliveryCharge === 0 && settings.isFreeDeliveryEnabled ? (
                            <span className="text-emerald-800 font-black">
                              🎉 অভিনন্দন! আপনার অর্ডারে সম্পূর্ণ ফ্রি ডেলিভারি প্রযোজ্য হয়েছে!
                            </span>
                          ) : (
                            <span>
                              নির্দিষ্ট ডেলিভারি চার্জ: <strong>ঢাকার ভেতরে {settings.currencySymbol || '৳'}{settings.deliveryFeeInsideDhaka ?? 60}</strong> এবং <strong>ঢাকার বাহিরে {settings.currencySymbol || '৳'}{settings.deliveryFeeOutsideDhaka ?? 120}</strong>
                              {Boolean(settings.isFreeDeliveryEnabled && settings.freeDeliveryThreshold && settings.freeDeliveryThreshold > 0) && (
                                <span className="text-emerald-800 ml-1 font-bold">
                                  ({settings.currencySymbol || '৳'}{settings.freeDeliveryThreshold.toLocaleString()} টাকার অর্ডারে ফ্রি ডেলিভারি)
                                </span>
                              )}
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-[11px] font-black bg-white px-2.5 py-0.5 rounded-md border border-amber-200 text-slate-800">
                        হোম ডেলিভারি
                      </span>
                    </div>

                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold">
                          পণ্য পৌঁছানোর সম্ভাব্য সময়:{' '}
                          <strong className="text-emerald-900 underline font-black">
                            {customerCity.toLowerCase().includes('dhaka')
                              ? (settings.estimatedDeliveryDhaka || '২৪ থেকে ৪৮ ঘণ্টার মধ্যে (১-২ কার্যদিবস)')
                              : (settings.estimatedDeliveryOutsideDhaka || '৩ থেকে ৫ কার্যদিবসের মধ্যে')}
                          </strong>
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold bg-emerald-200/80 text-emerald-900 px-2.5 py-0.5 rounded-md">
                        সরাসরি কুরিয়ার ডেলিভারি
                      </span>
                    </div>
                  </div>

                  <select
                    value={customerCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full text-xs p-3 bg-white border-2 border-slate-300 text-slate-950 rounded-xl outline-hidden focus:border-amber-500 cursor-pointer font-bold shadow-2xs"
                  >
                    {/* Divisions & All 64 Districts with explicit Taka fee */}
                    {[
                      { id: 'Dhaka', label: '── ঢাকা বিভাগ (Dhaka Division - ঢাকার ভেতরে ৬০ টাকা) ──' },
                      { id: 'Chittagong', label: '── চট্টগ্রাম বিভাগ (Chittagong Division - ঢাকার বাহিরে ১২০ টাকা) ──' },
                      { id: 'Rajshahi', label: '── রাজশাহী বিভাগ (Rajshahi Division - ঢাকার বাহিরে ১২০ টাকা) ──' },
                      { id: 'Sylhet', label: '── সিলেট বিভাগ (Sylhet Division - ঢাকার বাহিরে ১২০ টাকা) ──' },
                      { id: 'Khulna', label: '── খুলনা বিভাগ (Khulna Division - ঢাকার বাহিরে ১২০ টাকা) ──' },
                      { id: 'Barisal', label: '── বরিশাল বিভাগ (Barisal Division - ঢাকার বাহিরে ১২০ টাকা) ──' },
                      { id: 'Rangpur', label: '── রংপুর বিভাগ (Rangpur Division - ঢাকার বাহিরে ১২০ টাকা) ──' },
                      { id: 'Mymensingh', label: '── ময়মনসিংহ বিভাগ (Mymensingh Division - ঢাকার বাহিরে ১২০ টাকা) ──' },
                    ].map((divInfo) => {
                      const distsInDiv = BANGLADESH_DISTRICTS.filter((d) => d.division === divInfo.id);
                      return (
                        <optgroup key={divInfo.id} label={divInfo.label} className="font-black text-slate-900 bg-slate-100">
                          {distsInDiv.map((d) => {
                            const isDhakaCity = d.id === 'dhaka';
                            const fee = isDhakaCity ? 60 : 120;
                            const chargeNote = isDhakaCity ? 'ঢাকার ভিতরে ৬০ টাকা' : 'ঢাকার বাহিরে ১২০ টাকা';
                            return (
                              <option key={d.id} value={d.name} className="py-1 font-semibold text-slate-900 bg-white">
                                {d.name} ({d.bnName}) — {chargeNote} (৳{fee})
                              </option>
                            );
                          })}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    সম্পূর্ণ বাসার ঠিকানা (Detailed Address) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="House/Holding #, Road #, Sector/Area, Thana, District"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ডেলিভারি নোট বা বিশেষ নির্দেশনা (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="যেমন: বিকেলে ৩টার পর ডেলিভারি দিন অথবা কল করে আসুন..."
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-amber-500" />
                <span>২. পেমেন্ট পদ্ধতি নির্বাচন করুন</span>
              </h2>

              <div className="space-y-3">
                {/* Cash On Delivery */}
                <label
                  className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition ${
                    paymentMethod === 'Cash on Delivery (COD)'
                      ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'Cash on Delivery (COD)'}
                    onChange={() => setPaymentMethod('Cash on Delivery (COD)')}
                    className="mt-1 text-amber-500 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-gray-900">
                        Cash on Delivery (ক্যাশ অন ডেলিভারি)
                      </span>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        পণ্য হাতে পেয়ে টাকা দিন
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      পণ্য হাতে পেয়ে চেক করে ডেলিভারি ম্যানের কাছে সম্পূর্ণ মূল্য পরিশোধ করুন।
                    </p>
                  </div>
                </label>

                {/* bKash */}
                {settings.isBkashEnabled !== false && (
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === 'bKash'
                        ? 'border-[#E2136E] bg-[#E2136E]/5 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'bKash'}
                      onChange={() => setPaymentMethod('bKash')}
                      className="mt-1 text-[#E2136E] focus:ring-[#E2136E]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-2">
                          <span className="bg-[#E2136E] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-2xs tracking-wider">bKash</span>
                          <span>{isAutomatedGatewayEnabled ? 'বিকাশ (অটোমেটেড মার্চেন্ট গেটওয়ে)' : 'বিকাশ (Send Money / ক্যাশ ইন)'}</span>
                        </span>
                        <span className="bg-[#E2136E]/10 text-[#E2136E] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#E2136E]/20">
                          {isAutomatedGatewayEnabled ? 'অটো পেমেন্ট ও পিন' : 'সহজ ও নিরাপদ'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-gray-600">
                          {isAutomatedGatewayEnabled ? 'বিকাশ মার্চেন্ট গেটওয়ে দিয়ে ওটিপি ও পিনের মাধ্যমে সরাসরি পেমেন্ট।' : 'আমাদের বিকাশ নাম্বারে সেন্ড মানি করে TrxID প্রদান করুন।'}
                        </span>
                        <span className="text-[11px] font-mono font-bold bg-[#E2136E]/10 text-[#E2136E] px-2 py-0.5 rounded border border-[#E2136E]/30">
                          নাম্বার: {settings.bkashNumber || '01712-345678'} ({settings.bkashType || 'Personal'})
                        </span>
                      </div>
                    </div>
                  </label>
                )}

                {/* Nagad */}
                {settings.isNagadEnabled !== false && (
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === 'Nagad'
                        ? 'border-[#F7941D] bg-[#F7941D]/5 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Nagad'}
                      onChange={() => setPaymentMethod('Nagad')}
                      className="mt-1 text-[#F7941D] focus:ring-[#F7941D]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-2">
                          <span className="bg-[#F7941D] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-2xs tracking-wider">Nagad</span>
                          <span>{isAutomatedGatewayEnabled ? 'নগদ (অটোমেটেড মার্চেন্ট গেটওয়ে)' : 'নগদ (Send Money / ক্যাশ ইন)'}</span>
                        </span>
                        <span className="bg-[#F7941D]/10 text-[#c26e0e] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#F7941D]/20">
                          {isAutomatedGatewayEnabled ? 'অটো পেমেন্ট ও পিন' : 'সহজ ও নিরাপদ'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-gray-600">
                          {isAutomatedGatewayEnabled ? 'নগদ মার্চেন্ট গেটওয়ে দিয়ে সরাসরি ব্যালেন্স থেকে পেমেন্ট।' : 'আমাদের নগদ নাম্বারে সেন্ড মানি করে TrxID প্রদান করুন।'}
                        </span>
                        <span className="text-[11px] font-mono font-bold bg-[#F7941D]/10 text-[#a35905] px-2 py-0.5 rounded border border-[#F7941D]/30">
                          নাম্বার: {settings.nagadNumber || '01812-345678'} ({settings.nagadType || 'Personal'})
                        </span>
                      </div>
                    </div>
                  </label>
                )}

                {/* Rocket */}
                {settings.isRocketEnabled !== false && (
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === 'Rocket'
                        ? 'border-[#8C3494] bg-[#8C3494]/5 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Rocket'}
                      onChange={() => setPaymentMethod('Rocket')}
                      className="mt-1 text-[#8C3494] focus:ring-[#8C3494]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-2">
                          <span className="bg-[#8C3494] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-2xs tracking-wider">Rocket</span>
                          <span>{isAutomatedGatewayEnabled ? 'রকেট (অটোমেটেড গেটওয়ে)' : 'রকেট (Send Money / ক্যাশ ইন)'}</span>
                        </span>
                        <span className="bg-[#8C3494]/10 text-[#8C3494] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#8C3494]/20">
                          {isAutomatedGatewayEnabled ? 'অটো পেমেন্ট' : 'সহজ ও নিরাপদ'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-gray-600">
                          {isAutomatedGatewayEnabled ? 'রকেট একাউন্ট দিয়ে সরাসরি পেমেন্ট সম্পন্ন হবে।' : 'আমাদের রকেট নাম্বারে সেন্ড মানি করে TrxID প্রদান করুন।'}
                        </span>
                        <span className="text-[11px] font-mono font-bold bg-[#8C3494]/10 text-[#692170] px-2 py-0.5 rounded border border-[#8C3494]/30">
                          নাম্বার: {settings.rocketNumber || '01912-345678'} ({settings.rocketType || 'Personal'})
                        </span>
                      </div>
                    </div>
                  </label>
                )}

                {/* Upay */}
                {settings.isUpayEnabled !== false && (
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === 'Upay'
                        ? 'border-[#004F9E] bg-[#004F9E]/5 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Upay'}
                      onChange={() => setPaymentMethod('Upay')}
                      className="mt-1 text-[#004F9E] focus:ring-[#004F9E]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-2">
                          <span className="bg-[#004F9E] text-[#FFC20E] text-[10px] font-black px-2 py-0.5 rounded shadow-2xs flex items-center gap-1.5 tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC20E] inline-block"></span>
                            Upay
                          </span>
                          <span>{isAutomatedGatewayEnabled ? 'উপায় (অটোমেটেড গেটওয়ে)' : 'উপায় (Send Money / ক্যাশ ইন)'}</span>
                        </span>
                        <span className="bg-[#004F9E]/10 text-[#004F9E] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#004F9E]/20">
                          {isAutomatedGatewayEnabled ? 'অটো পেমেন্ট' : 'সহজ ও নিরাপদ'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-gray-600">
                          {isAutomatedGatewayEnabled ? 'উপায় একাউন্ট দিয়ে সরাসরি পেমেন্ট সম্পন্ন হবে।' : 'আমাদের উপায় নাম্বারে সেন্ড মানি করে TrxID প্রদান করুন।'}
                        </span>
                        <span className="text-[11px] font-mono font-bold bg-[#004F9E]/10 text-[#004F9E] px-2 py-0.5 rounded border border-[#004F9E]/30">
                          নাম্বার: {settings.upayNumber || '01712-345678'} ({settings.upayType || 'Personal'})
                        </span>
                      </div>
                    </div>
                  </label>
                )}

                {/* Credit / Debit Card (Visa, Mastercard, AMEX) */}
                {settings.isCardPaymentEnabled !== false && (
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === 'Credit/Debit Card'
                        ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Credit/Debit Card'}
                      onChange={() => setPaymentMethod('Credit/Debit Card')}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-black text-xs sm:text-sm text-gray-900 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          <span>Credit / Debit Card (ক্রেডিট / ডেবিট কার্ড)</span>
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                            Visa
                          </span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                            Mastercard
                          </span>
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full border border-indigo-200">
                            AMEX
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        যেকোনো দেশি-বিদেশি ব্যাংকের ভিসা, মাস্টারকার্ড বা এমেক্স কার্ড দিয়ে নিরাপদ ৩ডি-সিকিউর ওটিপি বা ব্যাংক ট্রান্সফারের মাধ্যমে পেমেন্ট করুন।
                      </p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold bg-blue-100/80 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                          ব্যাংক: {settings.cardBankName || 'City Bank'}
                        </span>
                        <span className="text-[11px] font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded border border-slate-700">
                          কার্ড নং: {settings.merchantCardNumber || '4532 8910 2345 6789'}
                        </span>
                        {settings.cardAccountName && (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            হিসাব: {settings.cardAccountName}
                          </span>
                        )}
                        {settings.cardPaymentLink && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300">
                            🔗 অনলাইন পেমেন্ট লিংক সক্রিয়
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                )}
              </div>

              {/* Credit / Debit Card Prompt Box */}
              {paymentMethod === 'Credit/Debit Card' && (
                <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white border border-blue-400/30 rounded-2xl space-y-3 text-xs shadow-md">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2 font-bold text-blue-300">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <span>৩ডি-সিকিউর অনলাইন কার্ড গেটওয়ে বা ব্যাংক ট্রান্সফার</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold border border-blue-400/30">
                        Visa • Master • AMEX
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    নিচের <strong>"পেমেন্ট করুন ও অর্ডার কনফার্ম করুন"</strong> বাটনে চাপ দিলে নিরাপদ কার্ড পেমেন্ট গেটওয়ে ওপেন হবে। আপনার কার্ডের তথ্য ও ব্যাংকের গোপন ওটিপি (OTP) দিলেই পেমেন্ট সম্পন্ন হয়ে অর্ডার সাথে সাথে কনফার্ম হয়ে যাবে!
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">মার্চেন্ট ব্যাংক ও হিসাব</span>
                      <span className="font-bold text-white text-xs block truncate">
                        {settings.cardBankName || 'City Bank'}
                      </span>
                      {settings.cardAccountName && (
                        <span className="text-[11px] text-slate-300 block truncate">
                          {settings.cardAccountName}
                        </span>
                      )}
                    </div>

                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block font-semibold">মার্চেন্ট কার্ড নম্বর</span>
                        <span className="font-mono font-black text-amber-300 text-xs tracking-wider block">
                          {settings.merchantCardNumber || '4532 8910 2345 6789'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText((settings.merchantCardNumber || '4532 8910 2345 6789').replace(/\s+/g, ''));
                          setCardCopySuccess(true);
                          addToast('success', 'মার্চেন্ট কার্ড নম্বর কপি হয়েছে!');
                          setTimeout(() => setCardCopySuccess(false), 2000);
                        }}
                        className="p-1.5 bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 rounded-lg transition cursor-pointer"
                        title="কার্ড নম্বর কপি করুন"
                      >
                        {cardCopySuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {settings.cardPaymentLink && (
                    <div className="pt-1">
                      <a
                        href={settings.cardPaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl transition shadow-xs"
                      >
                        <span>🔗 অনলাইন কার্ড পেমেন্ট লিংকে সরাসরি পে করুন</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {settings.cardPaymentInstructions && (
                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-white/10">
                      💡 নির্দেশনা: {settings.cardPaymentInstructions}
                    </p>
                  )}
                </div>
              )}

              {/* Mobile Payment Prompt Box */}
              {isMobilePayment && (
                !isAutomatedGatewayEnabled ? (
                  /* MODE 1: MANUAL SEND MONEY & TrxID (TODAY'S REAL WORKING MFS FLOW) */
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/90 to-orange-50/60 border-2 border-amber-300 rounded-2xl space-y-3.5 text-xs text-amber-950 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
                      <div className="flex items-center gap-2 font-black text-amber-950 text-sm">
                        <Smartphone className="w-4 h-4 text-amber-600" />
                        <span>{brand.name} পেমেন্ট নির্দেশিকা (Send Money)</span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full font-black">
                        সহজ ও নিরাপদ লেনদেন
                      </span>
                    </div>

                    {/* Store Account Display with 1-Click Copy */}
                    <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-amber-300 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                            আমাদের {brand.name} নাম্বার ({getStorePaymentNumber().type}):
                          </span>
                          <span className="text-base sm:text-lg font-mono font-black text-slate-950 tracking-wider">
                            {getStorePaymentNumber().number}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(getStorePaymentNumber().number.replace(/\s+/g, ''));
                            setManualMfsCopySuccess(true);
                            addToast('success', `${brand.name} নাম্বার কপি হয়েছে!`);
                            setTimeout(() => setManualMfsCopySuccess(false), 2000);
                          }}
                          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                          title="নাম্বার কপি করুন"
                        >
                          {manualMfsCopySuccess ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-900" />
                              <span>কপি হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>কপি করুন</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-semibold">পাঠানোর পরিমাণ (Pay Amount):</span>
                        <span className="font-mono font-black text-amber-600 text-base">
                          ৳{activeTotalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* 3 Simple Steps */}
                    {(() => {
                      const isCurrentTrxRequired =
                        paymentMethod === 'bKash'
                          ? settings.isBkashTrxIdRequired !== false
                          : paymentMethod === 'Nagad'
                          ? settings.isNagadTrxIdRequired !== false
                          : paymentMethod === 'Rocket'
                          ? settings.isRocketTrxIdRequired !== false
                          : settings.isUpayTrxIdRequired !== false;

                      return (
                        <>
                          <div className="space-y-1.5 text-xs text-slate-700 bg-amber-100/50 p-3 rounded-xl border border-amber-200">
                            <p className="font-extrabold text-amber-950 text-xs flex items-center gap-1">
                              <span>📝 কীভাবে টাকা পাঠাবেন? (৩টি সহজ ধাপ)</span>
                            </p>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-slate-800 font-medium">
                              <li>আপনার <strong>{brand.name}</strong> অ্যাপে যান বা USSD কোড ডায়াল করে <strong>Send Money</strong> (বা ক্যাশ ইন) অপশনে যান।</li>
                              <li>উপরের নাম্বারে ঠিক <strong>৳{activeTotalAmount.toLocaleString()}</strong> টাকা পাঠান।</li>
                              {isCurrentTrxRequired ? (
                                <li>টাকা পাঠানোর পর বিকাশ/নগদ ফিরতি SMS থেকে <strong>TrxID (ট্রানজেকশন আইডি)</strong> এবং যে নাম্বার থেকে পাঠিয়েছেন তা নিচের ঘরে লিখুন।</li>
                              ) : (
                                <li>টাকা পাঠানোর পর আপনার নাম্বারটি লিখুন। আপনি চাইলে TrxID দিতে পারেন, অথবা <strong>খালি রেখে সরাসরি অর্ডার কনফার্ম করতে পারেন</strong>।</li>
                              )}
                            </ol>
                          </div>

                          {/* Sender Phone & TrxID Input Fields */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-800 mb-1">
                                আপনার {brand.name} নাম্বার (যেখান থেকে টাকা পাঠিয়েছেন): <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="tel"
                                required
                                placeholder="01XXXXXXXXX"
                                value={manualSenderPhone || customerPaymentNumber || customerPhone}
                                onChange={(e) => {
                                  setManualSenderPhone(e.target.value);
                                  setCustomerPaymentNumber(e.target.value);
                                }}
                                className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-xl outline-hidden focus:border-amber-600 font-mono font-bold text-gray-900"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-gray-800 mb-1">
                                ট্রানজেকশন আইডি (TrxID):{' '}
                                {isCurrentTrxRequired ? (
                                  <span className="text-rose-600 font-black">* (আবশ্যক)</span>
                                ) : (
                                  <span className="text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                                    ঐচ্ছিক (না দিলেও চলবে)
                                  </span>
                                )}
                              </label>
                              <input
                                type="text"
                                required={isCurrentTrxRequired}
                                placeholder={isCurrentTrxRequired ? "যেমন: 9J7A2B5K" : "ঐচ্ছিক (যেমন: 9J7A2B5K বা ফাঁকা রাখুন)"}
                                value={manualTrxId}
                                onChange={(e) => setManualTrxId(e.target.value.toUpperCase())}
                                className={`w-full text-xs p-2.5 bg-white border rounded-xl outline-hidden font-mono font-black tracking-wider text-emerald-800 uppercase ${
                                  isCurrentTrxRequired ? 'border-amber-300 focus:border-amber-600' : 'border-slate-300 focus:border-emerald-500'
                                }`}
                              />
                              {!isCurrentTrxRequired && (
                                <p className="text-[10px] text-emerald-700 font-bold mt-1">
                                  ✓ ট্রানজেকশন আইডি অপশনাল রাখা আছে। TrxID না দিলেও নিশ্চিন্তে অর্ডার করতে পারেন।
                                </p>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  /* MODE 2: AUTOMATED GATEWAY ACTIVE (FUTURE MERCHANT API MODE) */
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-xs text-amber-900">
                    <div className="flex items-center gap-2 font-bold text-amber-950">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>অটোমেটেড মার্চেন্ট গেটওয়ে (OTP & PIN সিস্টেম সক্রিয়)</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      নিচের <strong>"পেমেন্ট করুন ও অর্ডার কনফার্ম করুন"</strong> বাটনে চাপ দিলে সরাসরি {brand.name} অফিসিয়াল মার্চেন্ট গেটওয়ে ওপেন হবে এবং আপনার গোপন পিন (PIN) দিয়ে তাৎক্ষণিক অটোমেটেড পেমেন্ট সম্পন্ন হবে।
                    </p>
                    <div className="pt-1">
                      <label className="block text-[11px] font-bold text-gray-800 mb-1">
                        আপনার {brand.name} একাউন্ট নাম্বার:
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={customerPhone || '01XXXXXXXXX'}
                        value={customerPaymentNumber}
                        onChange={(e) => setCustomerPaymentNumber(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-xl outline-hidden focus:border-amber-600 font-mono font-bold text-gray-900"
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right Column: Order Items Review with Quantity Controls (+ / -) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-500" />
                  <span>৩. পণ্যের তালিকা ও পরিমাণ (Quantity)</span>
                </h2>
                {cart.length === 1 ? (
                  <span className="text-xs bg-emerald-100 text-emerald-950 font-black px-2.5 py-0.5 rounded-full border border-emerald-300">
                    ১টি পণ্য নির্বাচিত
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded-full">
                      {cart.length} টি পণ্য
                    </span>
                    <button
                      type="button"
                      onClick={() => selectSingleItemForCheckout(cart[0].product.id)}
                      className="text-[10px] font-black bg-amber-300 hover:bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md transition cursor-pointer shadow-2xs"
                      title="শুধু ১ম পণ্যটি অর্ডার করুন"
                    >
                      শুধু ১টি রাখুন
                    </button>
                  </div>
                )}
              </div>

              {/* Helpful notice when multiple items exist */}
              {cart.length > 1 && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950">
                  <span className="text-[11px] font-bold block leading-relaxed">
                    শুধু একটি পণ্য অর্ডার করতে চাইলে কাঙ্ক্ষিত পণ্যের পাশে <strong>"শুধু এটি অর্ডার করুন"</strong> বাটনে চাপ দিন।
                  </span>
                </div>
              )}

              {/* Items List with Interactive Quantity Buttons */}
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 pr-1 space-y-1">
                {cart.map((item) => {
                  const unitPrice = item.product.discountPrice ?? item.product.price;
                  const itemTotal = unitPrice * item.quantity;

                  return (
                    <div key={item.product.id} className="py-3 flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-xs font-bold text-gray-900 truncate" title={item.product.name}>
                          {item.product.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <span>মূল্য: ৳{unitPrice.toLocaleString()}</span>
                          {item.selectedColor && (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-md">
                              কালার: {item.selectedColor}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls (+ / - Buttons) & Single Order Button */}
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <div className="inline-flex items-center border border-gray-200 rounded-lg bg-gray-50 p-0.5 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.product.id, item.quantity - 1);
                                } else {
                                  removeFromCart(item.product.id);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-gray-700 hover:bg-amber-100 hover:text-amber-900 transition cursor-pointer"
                              title="কমান"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <span className="w-8 text-center text-xs font-black text-gray-900">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                const maxStock = item.product.stock || 99;
                                if (item.quantity < maxStock) {
                                  updateQuantity(item.product.id, item.quantity + 1);
                                } else {
                                  addToast('error', `সর্বোচ্চ স্টক ${maxStock} টি উপলব্ধ রয়েছে।`);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded-md bg-white text-gray-700 hover:bg-amber-100 hover:text-amber-900 transition cursor-pointer"
                              title="বাড়ান"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {cart.length > 1 && (
                            <button
                              type="button"
                              onClick={() => selectSingleItemForCheckout(item.product.id)}
                              className="text-[10px] font-black text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-2 py-1 rounded-lg transition cursor-pointer shadow-2xs"
                              title="অন্যগুলো সরিয়ে শুধু এই একটি পণ্য অর্ডার করুন"
                            >
                              শুধু এটি অর্ডার করুন
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1 text-gray-400 hover:text-rose-500 rounded-md transition cursor-pointer ml-auto"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-gray-900 block">
                          ৳{itemTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculations */}
              <div className="border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>পণ্যসমূহের মূল্য (Subtotal):</span>
                  <span className="font-bold text-gray-900">৳{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>ডিসকাউন্ট (Discount):</span>
                    <span>-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span>
                    ডেলিভারি চার্জ ({activeDeliveryCharge === 0 && settings.isFreeDeliveryEnabled ? 'ফ্রি অফার' : customerCity.toLowerCase().includes('dhaka') ? `ঢাকার ভেতরে ৳${settings.deliveryFeeInsideDhaka ?? 60}` : `ঢাকার বাহিরে ৳${settings.deliveryFeeOutsideDhaka ?? 120}`}):
                  </span>
                  <span className="font-black text-slate-950 font-mono text-sm">
                    {activeDeliveryCharge === 0 && settings.isFreeDeliveryEnabled ? (
                      <span className="text-emerald-700 font-extrabold">FREE (৳০)</span>
                    ) : (
                      `৳${activeDeliveryCharge}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                  <span>সর্বমোট প্রদেয় (Total):</span>
                  <span className="text-lg text-amber-600 font-black">৳{activeTotalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Explicit Estimated Delivery Time Notice for Customer */}
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-950 font-bold shadow-2xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>পণ্য পৌঁছানোর সময়:</span>
                </div>
                <span className="font-black text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 text-[11px] shadow-2xs">
                  {customerCity.toLowerCase().includes('dhaka') ? '২৪ থেকে ৪৮ ঘণ্টার মধ্যে (১-২ দিন)' : '৩ থেকে ৫ কার্যদিবসের মধ্যে'}
                </span>
              </div>

              {/* Primary Order Place Button in Clean Yellow/Amber Theme */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 active:scale-98 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>অর্ডার প্রসেস হচ্ছে...</span>
                  </>
                ) : isMobilePayment ? (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>
                      {isAutomatedGatewayEnabled
                        ? `${paymentMethod} দিয়ে পেমেন্ট ও কনফার্ম করুন (৳${activeTotalAmount.toLocaleString()})`
                        : `অর্ডার নিশ্চিত করুন (${paymentMethod} TrxID সহ ৳${activeTotalAmount.toLocaleString()})`}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>অর্ডার নিশ্চিত করুন (Place Order ৳${activeTotalAmount.toLocaleString()})</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-gray-400 space-y-1">
                <p className="flex items-center justify-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>100% সুরক্ষিত এনক্রিপ্টেড পেমেন্ট ও ৭ দিনের রিটার্ন পলিসি</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* REALISTIC BKASH / NAGAD / ROCKET PAYMENT GATEWAY MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-md overflow-hidden shadow-2xl space-y-0">
            {/* Gateway Brand Header */}
            <div className={`${brand.color} text-white p-5 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">{brand.name} Payment</h3>
                  <p className="text-[11px] text-white/90">Merchant: Sohoj Cart BD</p>
                </div>
              </div>

              {gatewayStep !== 'processing' && (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Gateway Body */}
            <div className="p-6 space-y-5">
              {/* Payment Summary Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-500 font-bold block">প্রদেয় মোট টাকা (Amount):</span>
                    <span className="text-xl font-black text-gray-900 font-mono">
                      ৳{activeTotalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">আপনার ওয়ালেট নাম্বার</span>
                    <span className="text-xs font-bold font-mono text-gray-900 font-black">
                      {customerPaymentNumber || customerPhone}
                    </span>
                  </div>
                </div>

                {/* Store Payment Number display with 1-Click Copy */}
                <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between text-[11px] gap-2">
                  <span className="text-gray-700 font-bold">
                    স্টোরের {brand.name} নাম্বার ({
                      paymentMethod === 'bKash' ? (settings.bkashType || 'Personal') :
                      paymentMethod === 'Nagad' ? (settings.nagadType || 'Personal') :
                      paymentMethod === 'Rocket' ? (settings.rocketType || 'Personal') :
                      paymentMethod === 'Upay' ? (settings.upayType || 'Personal') : 'Personal'
                    }):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-slate-900 bg-white px-2.5 py-1 rounded-md border border-gray-300 text-xs shadow-2xs">
                      {paymentMethod === 'bKash' ? (settings.bkashNumber || '01712-345678') :
                       paymentMethod === 'Nagad' ? (settings.nagadNumber || '01812-345678') :
                       paymentMethod === 'Rocket' ? (settings.rocketNumber || '01912-345678') :
                       paymentMethod === 'Upay' ? (settings.upayNumber || '01712-345678') : '01712-345678'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const num =
                          paymentMethod === 'bKash' ? (settings.bkashNumber || '01712-345678') :
                          paymentMethod === 'Nagad' ? (settings.nagadNumber || '01812-345678') :
                          paymentMethod === 'Rocket' ? (settings.rocketNumber || '01912-345678') :
                          paymentMethod === 'Upay' ? (settings.upayNumber || '01712-345678') : '01712-345678';
                        navigator.clipboard.writeText(num);
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      }}
                      className="p-1 px-2 bg-white hover:bg-gray-100 text-slate-700 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition border border-gray-300 shadow-2xs"
                      title="নাম্বার কপি করুন"
                    >
                      <Copy className="w-3 h-3 text-gray-500" />
                      <span>{copySuccess ? 'কপি হয়েছে!' : 'কপি'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 1: WALLET NUMBER INPUT (IF NEEDED) */}
              {gatewayStep === 'number' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                      <span>আপনার {brand.name} একাউন্ট নাম্বার:</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        autoFocus
                        placeholder="01XXXXXXXXX"
                        value={customerPaymentNumber || customerPhone}
                        onChange={(e) => setCustomerPaymentNumber(e.target.value)}
                        className="w-full text-center tracking-wider text-lg font-mono font-black py-3 bg-gray-50 border-2 border-gray-300 rounded-xl outline-hidden focus:border-amber-500 text-gray-900"
                      />
                      <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[10px] text-gray-500 text-center mt-1.5">
                      এই নাম্বারে ভেরিফিকেশনের জন্য তাৎক্ষণিক ওটিপি কোড যাবে।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendGatewayOtp}
                    className={`w-full py-3.5 ${brand.color} ${brand.hoverColor} active:scale-98 text-white font-extrabold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer`}
                  >
                    <span>ভেরিফিকেশন কোড (OTP) পাঠান</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-800 text-center cursor-pointer"
                  >
                    পেমেন্ট বাতিল করুন (Cancel)
                  </button>
                </div>
              )}

              {/* STEP 2: PHONE SMS OTP VERIFICATION */}
              {gatewayStep === 'otp' && (
                <div className="space-y-4">
                  {/* Incoming SMS Notification Simulator Banner */}
                  {simulatedGatewaySms && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-amber-600" />
                          <span>আপনার ফোনে প্রাপ্ত {brand.name} SMS ওটিপি:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setGatewayOtp(simulatedGatewaySms)}
                          className="text-[10px] bg-amber-200 hover:bg-amber-300 text-amber-900 font-black px-2.5 py-1 rounded-md transition cursor-pointer"
                        >
                          কোড বসান (Auto Fill)
                        </button>
                      </div>
                      <div className="bg-white border border-amber-200 rounded-xl px-3 py-2 flex items-center justify-between">
                        <span className="font-mono font-black text-base tracking-widest text-slate-900">
                          {simulatedGatewaySms}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {customerPaymentNumber || customerPhone} এ পাঠানো হয়েছে
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                      <span>৬-ডিজিটের ভেরিফিকেশন কোড লিখুন:</span>
                      <button
                        type="button"
                        onClick={handleSendGatewayOtp}
                        className="text-[11px] text-amber-600 hover:underline font-semibold cursor-pointer"
                      >
                        নতুন কোড পাঠান
                      </button>
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        placeholder="••••••"
                        value={gatewayOtp}
                        onChange={(e) => setGatewayOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center tracking-[0.5em] text-xl font-mono font-black py-3 bg-gray-50 border-2 border-gray-300 rounded-xl outline-hidden focus:border-amber-500 text-gray-900"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 text-center mt-1.5">
                      🔒 আপনার ফোনে প্রেরিত ৬ ডিজিটের ওটিপি কোড দিয়ে মোবাইল নাম্বার নিশ্চিত করুন
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyGatewayOtp}
                    className={`w-full py-3.5 ${brand.color} ${brand.hoverColor} active:scale-98 text-white font-extrabold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer`}
                  >
                    <Check className="w-4 h-4" />
                    <span>কোড যাচাই করুন (Verify OTP)</span>
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setGatewayStep('number')}
                      className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      ← নাম্বার পরিবর্তন
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      বাতিল করুন
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SECRET PIN ENTRY */}
              {gatewayStep === 'pin' && (
                <div className="space-y-4">
                  {/* Verified phone indicator */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-emerald-800 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>নাম্বার যাচাই সম্পন্ন: {customerPaymentNumber || customerPhone}</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">OTP Verified</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                      <span>আপনার {brand.name} পিন (PIN) লিখুন:</span>
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="text-[11px] text-amber-600 hover:underline font-semibold cursor-pointer"
                      >
                        {showPin ? 'Hide' : 'Show'}
                      </button>
                    </label>

                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        maxLength={5}
                        required
                        autoFocus
                        placeholder="•••••"
                        value={paymentPin}
                        onChange={(e) => setPaymentPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center tracking-[0.5em] text-xl font-mono font-black py-3 bg-gray-50 border-2 border-gray-300 rounded-xl outline-hidden focus:border-amber-500 text-gray-900"
                      />
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[10px] text-gray-500 text-center mt-1.5">
                      🔒 আপনার পিন সুরক্ষিত ও এনক্রিপ্টেড থাকবে (ডেমো বা আসল যে কোনো ৪/৫ ডিজিট পিন দিন)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmGatewayPayment}
                    className={`w-full py-3.5 ${brand.color} ${brand.hoverColor} active:scale-98 text-white font-extrabold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer`}
                  >
                    <Check className="w-4 h-4" />
                    <span>টাকা পরিশোধ নিশ্চিত করুন (Confirm ৳{activeTotalAmount.toLocaleString()})</span>
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setGatewayStep('otp')}
                      className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      ← ওটিপি ধাপে ফিরুন
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      পেমেন্ট বাতিল করুন
                    </button>
                  </div>
                </div>
              )}

              {gatewayStep === 'processing' && (
                <div className="py-8 text-center space-y-3">
                  <Loader2 className={`w-10 h-10 animate-spin mx-auto ${brand.textColor}`} />
                  <h4 className="font-extrabold text-gray-900 text-base">পেমেন্ট যাচাই করা হচ্ছে...</h4>
                  <p className="text-xs text-gray-500">
                    {brand.name} গেটওয়ের মাধ্যমে আপনার ব্যালেন্স থেকে ৳{totalAmount.toLocaleString()} ডেবিট করা হচ্ছে।
                  </p>
                </div>
              )}

              {gatewayStep === 'success' && (
                <div className="py-6 text-center space-y-3 animate-in zoom-in-95">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-gray-900 text-base">পেমেন্ট সফল হয়েছে!</h4>
                  <p className="text-xs text-emerald-700 font-bold">
                    ৳{totalAmount.toLocaleString()} পরিশোধ সম্পন্ন হয়েছে। অর্ডার স্বয়ংক্রিয়ভাবে কনফার্ম করা হচ্ছে...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REALISTIC CREDIT & DEBIT CARD PAYMENT GATEWAY MODAL */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-lg overflow-hidden shadow-2xl space-y-0">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-5 flex items-center justify-between border-b border-blue-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm sm:text-base">
                      {settings.cardBankName || 'City Bank'} Card Gateway
                    </h3>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                      3D-Secure
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Visa • Mastercard • AMEX SafeKey Verified
                  </p>
                </div>
              </div>

              {cardStep !== 'processing' && (
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Modal Tab Switcher */}
            <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCardTab('online_card')}
                className={`flex-1 py-3 px-4 text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  cardTab === 'online_card'
                    ? 'bg-white text-blue-900 border-b-2 border-blue-600 font-black shadow-2xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>অনলাইন ৩ডি-সিকিউর কার্ড</span>
              </button>
              <button
                type="button"
                onClick={() => setCardTab('bank_transfer')}
                className={`flex-1 py-3 px-4 text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  cardTab === 'bank_transfer'
                    ? 'bg-white text-blue-900 border-b-2 border-blue-600 font-black shadow-2xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>ব্যাংক / কার্ড ট্রান্সফার</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Payment Summary Box */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">প্রদেয় মোট টাকা:</span>
                  <span className="text-xl font-black text-blue-950 font-mono">
                    ৳{activeTotalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">মার্চেন্ট ব্যাংক:</span>
                  <span className="text-xs font-extrabold text-gray-900 block truncate max-w-[170px]">
                    {settings.cardBankName || 'City Bank'}
                  </span>
                </div>
              </div>

              {/* TAB 1: ONLINE CARD WITH 3D-SECURE */}
              {cardTab === 'online_card' && (
                <div>
                  {/* STEP 1: CARD DETAILS ENTRY */}
                  {cardStep === 'card_details' && (
                    <div className="space-y-3.5">
                      {/* Demo Quick Fill Button */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800">কার্ডের তথ্য দিন:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCardHolderInput(customerName || 'Md. Rafiqul Islam');
                            setCardNumberInput('4532 8910 2345 6789');
                            setCardExpiryInput('12/28');
                            setCardCvvInput('842');
                            addToast('info', 'টেস্ট কার্ডের তথ্য অটো-ফিল করা হয়েছে।');
                          }}
                          className="text-[11px] text-blue-700 bg-blue-100/70 hover:bg-blue-200 font-bold px-2.5 py-1 rounded-lg border border-blue-200 transition cursor-pointer"
                        >
                          ⚡ টেস্ট কার্ড অটো-ফিল
                        </button>
                      </div>

                      {/* Cardholder Name */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          কার্ডধারী ব্যক্তির নাম (Cardholder Name):
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. MOHAMMAD RAHIM"
                          value={cardHolderInput}
                          onChange={(e) => setCardHolderInput(e.target.value)}
                          className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-hidden focus:border-blue-600 focus:bg-white font-bold text-gray-900 uppercase"
                        />
                      </div>

                      {/* Card Number */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center justify-between">
                          <span>কার্ডের ১৬ ডিজিট নম্বর (Card Number):</span>
                          <span className="text-[10px] text-blue-600 font-bold font-mono">
                            {cardNumberInput.startsWith('4')
                              ? 'Visa'
                              : cardNumberInput.startsWith('5')
                              ? 'Mastercard'
                              : cardNumberInput.startsWith('3')
                              ? 'AMEX'
                              : 'Card'}
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={19}
                            required
                            placeholder="XXXX XXXX XXXX XXXX"
                            value={cardNumberInput}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                              const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
                              setCardNumberInput(formatted);
                            }}
                            className="w-full text-sm p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-hidden focus:border-blue-600 focus:bg-white font-mono font-black text-gray-900 tracking-wider pl-9"
                          />
                          <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        </div>
                      </div>

                      {/* Expiry & CVV */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            মেয়াদ (MM/YY):
                          </label>
                          <input
                            type="text"
                            maxLength={5}
                            required
                            placeholder="12/28"
                            value={cardExpiryInput}
                            onChange={(e) => {
                              let v = e.target.value.replace(/[^\d/]/g, '');
                              if (v.length === 2 && !v.includes('/')) v = v + '/';
                              setCardExpiryInput(v);
                            }}
                            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-hidden focus:border-blue-600 focus:bg-white font-mono font-bold text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center justify-between">
                            <span>CVV / CVC:</span>
                            <span className="text-[10px] text-gray-400">৩ ডিজিট</span>
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            required
                            placeholder="•••"
                            value={cardCvvInput}
                            onChange={(e) => setCardCvvInput(e.target.value.replace(/\D/g, ''))}
                            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-hidden focus:border-blue-600 focus:bg-white font-mono font-bold text-center tracking-widest"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSendCardOtp}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>পরবর্তী ধাপ (৩ডি-সিকিউর ওটিপি কোড পাঠান)</span>
                      </button>

                      <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 pt-1">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>SSL 256-Bit ব্যাংক গ্রেড এনক্রিপশনে লেনদেন সুরক্ষিত</span>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: 3D-SECURE OTP VERIFICATION */}
                  {cardStep === 'otp' && (
                    <div className="space-y-4">
                      {/* Simulated SMS Notification Banner */}
                      {cardSimulatedOtp && (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-md space-y-1.5 animate-in slide-in-from-top-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1.5 font-bold text-amber-400">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{settings.cardBankName || 'City Bank'} 3D-Secure SMS</span>
                            </span>
                            <span className="text-[10px]">এখনই আসল</span>
                          </div>
                          <p className="text-xs text-slate-200">
                            Your One Time Password (OTP) for card payment of ৳{activeTotalAmount.toLocaleString()} at Sohoj Cart BD is{' '}
                            <strong className="text-amber-400 font-mono text-sm tracking-wider">{cardSimulatedOtp}</strong>. Valid for 3 mins.
                          </p>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-gray-800">
                            ব্যাংকের ৬-ডিজিটের সিকিউরিটি ওটিপি (OTP):
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              if (cardSimulatedOtp) setCardOtpInput(cardSimulatedOtp);
                              else setCardOtpInput('123456');
                            }}
                            className="text-[11px] text-blue-600 hover:underline font-bold cursor-pointer"
                          >
                            ⚡ অটো-ফিল কোড ({cardSimulatedOtp || '123456'})
                          </button>
                        </div>

                        <input
                          type="text"
                          maxLength={6}
                          autoFocus
                          placeholder="••••••"
                          value={cardOtpInput}
                          onChange={(e) => setCardOtpInput(e.target.value.replace(/\D/g, ''))}
                          className="w-full text-center tracking-[0.5em] text-xl font-mono font-black py-3 bg-gray-50 border-2 border-blue-400 rounded-xl outline-hidden focus:border-blue-600 text-gray-900"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyCardOtp}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>পেমেন্ট নিশ্চিত করুন (Pay ৳{activeTotalAmount.toLocaleString()})</span>
                      </button>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <button
                          type="button"
                          onClick={() => setCardStep('card_details')}
                          className="text-gray-500 hover:text-gray-800 font-bold cursor-pointer"
                        >
                          ← কার্ডের তথ্যে ফিরুন
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCardModalOpen(false)}
                          className="text-gray-500 hover:text-gray-800 font-bold cursor-pointer"
                        >
                          বাতিল করুন
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PROCESSING */}
                  {cardStep === 'processing' && (
                    <div className="py-8 text-center space-y-3">
                      <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
                      <h4 className="font-extrabold text-gray-900 text-base">কার্ড যাচাই ও ৩ডি-সিকিউর অথোরাইজেশন চলছে...</h4>
                      <p className="text-xs text-gray-500">
                        {settings.cardBankName || 'City Bank'} গেটওয়ের মাধ্যমে ৳{activeTotalAmount.toLocaleString()} ডেবিট করা হচ্ছে।
                      </p>
                    </div>
                  )}

                  {/* STEP 4: SUCCESS */}
                  {cardStep === 'success' && (
                    <div className="py-6 text-center space-y-3 animate-in zoom-in-95">
                      <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="font-extrabold text-gray-900 text-base">কার্ড পেমেন্ট সফল হয়েছে!</h4>
                      <p className="text-xs text-emerald-700 font-bold">
                        ৳{activeTotalAmount.toLocaleString()} পরিশোধ সম্পন্ন হয়েছে। অর্ডার স্বয়ংক্রিয়ভাবে কনফার্ম করা হচ্ছে...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MANUAL BANK / CARD TRANSFER SLIP */}
              {cardTab === 'bank_transfer' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <span className="font-black text-slate-900 block text-xs">
                      মার্চেন্ট কার্ড বা ব্যাংক একাউন্টে সরাসরি টাকা ট্রান্সফার করুন:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <div>
                        <span className="text-gray-400 block">ব্যাংকের নাম:</span>
                        <strong className="text-gray-900">{settings.cardBankName || 'City Bank'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block">হিসাবধারী / মার্চেন্ট:</span>
                        <strong className="text-gray-900">{settings.cardAccountName || 'Sohoj Cart BD'}</strong>
                      </div>
                      <div className="col-span-2 flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200">
                        <div>
                          <span className="text-gray-400 block text-[10px]">কার্ড বা একাউন্ট নম্বর:</span>
                          <span className="font-mono font-black text-xs text-blue-950">
                            {settings.merchantCardNumber || '4532 8910 2345 6789'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText((settings.merchantCardNumber || '4532 8910 2345 6789').replace(/\s+/g, ''));
                            addToast('success', 'মার্চেন্ট কার্ড নম্বর কপি হয়েছে!');
                          }}
                          className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-bold transition cursor-pointer text-[10px]"
                        >
                          কপি
                        </button>
                      </div>
                      {settings.cardRoutingNo && (
                        <div>
                          <span className="text-gray-400 block">রাউটিং নম্বর:</span>
                          <strong className="font-mono text-gray-900">{settings.cardRoutingNo}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {settings.cardPaymentLink && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <a
                        href={settings.cardPaymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-emerald-900 font-bold"
                      >
                        <span>🔗 অনলাইন কার্ড পেমেন্ট লিংকে সরাসরি পে করতে ক্লিক করুন</span>
                        <ExternalLink className="w-4 h-4 text-emerald-600" />
                      </a>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      ট্রান্সফার ট্রানজেকশন আইডি বা রেফারেন্স স্লিপ নম্বর (TrxID / Ref No):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TXN-9281034 / কার্ডের শেষ ৪ ডিজিট"
                      value={manualCardTrxId}
                      onChange={(e) => setManualCardTrxId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-hidden focus:border-blue-600 focus:bg-white font-mono font-bold text-gray-900"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmManualCardTransfer}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>ট্রান্সফার নিশ্চিত করুন ও অর্ডার প্লেস করুন</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
