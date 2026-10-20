import React, { useState } from 'react';
import {
  X,
  Truck,
  CheckCircle2,
  ExternalLink,
  Printer,
  Copy,
  Check,
  Phone,
  MapPin,
  DollarSign,
  AlertCircle,
  Sparkles,
  MessageCircle,
  Globe,
  LogIn,
  UserPlus,
  Mail,
  PhoneCall,
} from 'lucide-react';
import { Order, StoreSettings } from '../../types';
import {
  bookSteadfastParcel,
  bookPathaoParcel,
  bookRedxParcel,
  bookManualCourierParcel,
  getCourierTrackingUrl,
  BANGLADESH_COURIERS,
} from '../../services/courierService';
import { updateOrderStatus } from '../../services/firestoreService';
import { useStore } from '../../context/StoreContext';

interface CourierDispatchModalProps {
  order: Order;
  settings: StoreSettings;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
}

export const CourierDispatchModal: React.FC<CourierDispatchModalProps> = ({
  order,
  settings,
  onClose,
  onSuccess,
}) => {
  const { addToast } = useStore();

  const [selectedCourier, setSelectedCourier] = useState<'steadfast' | 'pathao' | 'redx' | 'manual'>(
    (settings.defaultCourier as any) || 'steadfast'
  );

  const [customCourierName, setCustomCourierName] = useState('Sundarban Courier');
  const [manualTrackingCode, setManualTrackingCode] = useState('');
  const [recipientName, setRecipientName] = useState(order.customerName || '');
  const [recipientPhone, setRecipientPhone] = useState(order.customerPhone || '');
  const [recipientAddress, setRecipientAddress] = useState(
    `${order.customerAddress || ''}, ${order.customerCity || ''}`
  );

  // COD amount calculation
  const defaultCod = order.paymentStatus === 'Paid' ? 0 : Number(order.totalAmount || 0);
  const [codAmount, setCodAmount] = useState<number>(defaultCod);
  const [specialNote, setSpecialNote] = useState(
    order.notes || 'ডেলিভারি দেওয়ার আগে কাস্টমারকে কল করবেন।'
  );

  const [isBooking, setIsBooking] = useState(false);
  const [bookedResult, setBookedResult] = useState<{
    provider: string;
    trackingCode: string;
    consignmentId: string;
    trackingUrl: string;
  } | null>(
    order.courierTrackingCode
      ? {
          provider: order.courierProvider || 'courier',
          trackingCode: order.courierTrackingCode,
          consignmentId: order.courierConsignmentId || order.courierTrackingCode,
          trackingUrl: getCourierTrackingUrl(
            order.courierProvider || 'courier',
            order.courierTrackingCode
          ),
        }
      : null
  );

  const [copiedCode, setCopiedCode] = useState(false);
  const [showPrintLabel, setShowPrintLabel] = useState(false);

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleConfirmBooking = async () => {
    if (!recipientPhone.trim() || recipientPhone.length < 11) {
      addToast('error', 'দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }
    if (!recipientAddress.trim()) {
      addToast('error', 'দেলিভারি ঠিকানা প্রদান করুন।');
      return;
    }

    setIsBooking(true);
    try {
      let result;

      if (selectedCourier === 'steadfast') {
        result = await bookSteadfastParcel(order, settings, specialNote);
      } else if (selectedCourier === 'pathao') {
        result = await bookPathaoParcel(order, settings, specialNote);
      } else if (selectedCourier === 'redx') {
        result = await bookRedxParcel(order, settings, specialNote);
      } else {
        result = bookManualCourierParcel(order, customCourierName, manualTrackingCode);
      }

      if (result.success) {
        // Save to Firestore and mark order as Shipped
        const bookedAt = new Date().toISOString();
        await updateOrderStatus(order.id, 'Shipped', order.paymentStatus, {
          courierProvider: result.courierProvider,
          courierTrackingCode: result.trackingCode,
          courierConsignmentId: result.consignmentId,
          courierStatus: 'In Transit',
          courierBookedAt: bookedAt,
          courierCodAmount: Number(codAmount) || 0,
          courierNotes: specialNote,
        });

        const updated: Order = {
          ...order,
          orderStatus: 'Shipped',
          courierProvider: result.courierProvider,
          courierTrackingCode: result.trackingCode,
          courierConsignmentId: result.consignmentId,
          courierStatus: 'In Transit',
          courierBookedAt: bookedAt,
          courierCodAmount: Number(codAmount) || 0,
          courierNotes: specialNote,
        };

        setBookedResult({
          provider: result.courierProvider,
          trackingCode: result.trackingCode,
          consignmentId: result.consignmentId,
          trackingUrl: result.trackingUrl,
        });

        addToast('success', result.message);
        onSuccess(updated);
      }
    } catch {
      addToast('error', 'কুরিয়ার বুকিং করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsBooking(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                <span>কুরিয়ার পার্সেল বুকিং (Courier Dispatcher)</span>
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                  #{order.orderNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                পাঠাও, স্টেডফাস্ট ও রেডএক্সে এক ক্লিকে পার্সেল বুক করুন ও ট্র্যাকিং কোড তৈরি করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 hover:text-slate-950 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 overscroll-contain">
          {/* ALREADY BOOKED BANNER */}
          {bookedResult && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>কুরিয়ারে সফলভাবে পার্সেল বুক করা হয়েছে!</span>
                </div>
                <span className="text-xs font-black uppercase px-2.5 py-0.5 bg-emerald-200 text-emerald-900 rounded-lg">
                  {bookedResult.provider}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-emerald-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    কুরিয়ার ট্র্যাকিং কোড (Consignment ID):
                  </span>
                  <span className="text-base font-black text-slate-950 font-mono tracking-wider">
                    {bookedResult.trackingCode}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyTracking(bookedResult.trackingCode)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>কপি করুন</span>
                      </>
                    )}
                  </button>

                  <a
                    href={bookedResult.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <span>লাইভ ট্র্যাক করুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => setShowPrintLabel(!showPrintLabel)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>পার্সেল স্লিপ</span>
                  </button>

                  {order.customerPhone && (
                    <a
                      href={`https://wa.me/88${order.customerPhone.replace(/[^0-9]/g, '').slice(-11)}?text=${encodeURIComponent(
                        `প্রিয় ${order.customerName},\nআপনার অর্ডার #${order.orderNumber} ${
                          bookedResult.provider === 'pathao'
                            ? 'পাঠাও কুরিয়ার'
                            : bookedResult.provider === 'redx'
                            ? 'রেডএক্স'
                            : 'স্টেডফাস্ট কুরিয়ার'
                        }-এ পাঠানো হয়েছে।\n\n📦 ট্র্যাকিং কোড: ${bookedResult.trackingCode}\n🔗 লাইভ ট্র্যাক করুন: ${bookedResult.trackingUrl}\n${
                          order.paymentStatus === 'Paid' ? '✅ মূল্য পরিশোধিত (COD: ৳০)' : `💵 ডেলিভারিতে পরিশোধযোগ্য: ৳${order.totalAmount} টাকা`
                        }\n\nধন্যবাদ সাথে থাকার জন্য!`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      title="কাস্টমারকে হোয়াটসঅ্যাপে ট্র্যাকিং পাঠান"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>হোয়াটসঅ্যাপে পাঠান</span>
                    </a>
                  )}
                </div>
              </div>

              {/* PRINTABLE SHIPPING LABEL PREVIEW */}
              {showPrintLabel && (
                <div className="p-4 bg-white rounded-2xl border-2 border-slate-300 shadow-sm space-y-3 text-slate-950">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-black uppercase text-slate-900">
                      📦 ডেলিভারি পার্সেল স্টিকার (Shipping Label Slip)
                    </span>
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>প্রিন্ট করুন</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">প্রেরক (Merchant):</p>
                      <p className="font-black text-slate-950">{settings.storeName || 'SohojCart BD'}</p>
                      <p className="text-[11px] text-slate-600 font-mono">{settings.contactPhone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">কুরিয়ার ও ট্র্যাকিং:</p>
                      <p className="font-black text-emerald-800 uppercase">{bookedResult.provider} Courier</p>
                      <p className="font-mono text-xs font-black text-slate-950">{bookedResult.trackingCode}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">গ্রাহকের ঠিকানা (Recipient):</p>
                    <p className="font-black text-slate-950 text-sm">{order.customerName}</p>
                    <p className="font-mono font-bold text-slate-900">ফোন: {order.customerPhone}</p>
                    <p className="text-slate-700 font-medium">{order.customerAddress}, {order.customerCity}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div>
                      <span className="text-[10px] font-bold text-amber-900 uppercase">কালেকশন অ্যামাউন্ট (COD):</span>
                      <p className="text-base font-black text-amber-950">
                        {order.paymentStatus === 'Paid' ? '৳০ (PAID - টাকা নেওয়া লাগবে না)' : `৳${order.totalAmount} টাকা`}
                      </p>
                    </div>
                    <div className="text-right font-mono text-[10px] text-slate-500">
                      ইনভয়েস: #{order.orderNumber}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 1. SELECT COURIER PROVIDER (পাঠাও, স্টেডফাস্ট, রেডএক্স) */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-900">
              কুরিয়ার কোম্পানি নির্বাচন করুন (Select Courier):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Steadfast */}
              <button
                type="button"
                onClick={() => setSelectedCourier('steadfast')}
                className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  selectedCourier === 'steadfast'
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">📦</span>
                  {selectedCourier === 'steadfast' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-950">স্টেডফাস্ট</p>
                  <p className="text-[10px] text-slate-500 font-medium">Steadfast Courier</p>
                </div>
              </button>

              {/* Pathao */}
              <button
                type="button"
                onClick={() => setSelectedCourier('pathao')}
                className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  selectedCourier === 'pathao'
                    ? 'border-rose-500 bg-rose-50/70 shadow-xs ring-2 ring-rose-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🚴</span>
                  {selectedCourier === 'pathao' && (
                    <CheckCircle2 className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-950">পাঠাও কুরিয়ার</p>
                  <p className="text-[10px] text-slate-500 font-medium">Pathao Courier</p>
                </div>
              </button>

              {/* RedX */}
              <button
                type="button"
                onClick={() => setSelectedCourier('redx')}
                className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  selectedCourier === 'redx'
                    ? 'border-red-500 bg-red-50/70 shadow-xs ring-2 ring-red-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🚚</span>
                  {selectedCourier === 'redx' && (
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-950">রেডএক্স</p>
                  <p className="text-[10px] text-slate-500 font-medium">RedX Logistics</p>
                </div>
              </button>

              {/* Manual / Sundarban */}
              <button
                type="button"
                onClick={() => setSelectedCourier('manual')}
                className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                  selectedCourier === 'manual'
                    ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">📋</span>
                  {selectedCourier === 'manual' && (
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-950">অন্যান্য / ম্যানুয়াল</p>
                  <p className="text-[10px] text-slate-500 font-medium">সুন্দরবন / এসএ</p>
                </div>
              </button>
            </div>
          </div>

          {/* SELECTED COURIER OFFICIAL PORTAL & HELPLINE CONTACT CARD */}
          {selectedCourier !== 'manual' && BANGLADESH_COURIERS[selectedCourier] ? (
            <div className="p-4 rounded-2xl border-2 border-slate-300 bg-white shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{BANGLADESH_COURIERS[selectedCourier].icon}</span>
                  <div>
                    <h4 className="text-xs font-black text-slate-950 flex items-center gap-2">
                      <span>{BANGLADESH_COURIERS[selectedCourier].nameBn} ({BANGLADESH_COURIERS[selectedCourier].name})</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {BANGLADESH_COURIERS[selectedCourier].badge}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {BANGLADESH_COURIERS[selectedCourier].descriptionBn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${BANGLADESH_COURIERS[selectedCourier].helplineRaw}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition shadow-xs cursor-pointer"
                    title="সরাসরি কাস্টমার কেয়ারে কল করুন"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>কল: {BANGLADESH_COURIERS[selectedCourier].helpline}</span>
                  </a>
                </div>
              </div>

              {/* Quick Links Row: Login, Register, Website */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                {/* Merchant Portal Login */}
                <a
                  href={BANGLADESH_COURIERS[selectedCourier].portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl font-black text-slate-950 transition shadow-2xs group cursor-pointer"
                  title="মার্চেন্ট ড্যাশবোর্ড ও পার্সেল ম্যানেজমেন্ট পোর্টালে লগইন করুন"
                >
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4 text-amber-600 group-hover:scale-110 transition" />
                    <span>মার্চেন্ট পোর্টাল (Login)</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                </a>

                {/* New Merchant Signup */}
                <a
                  href={BANGLADESH_COURIERS[selectedCourier].registerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-xl font-black text-slate-950 transition shadow-2xs group cursor-pointer"
                  title="নতুন মার্চেন্ট অ্যাকাউন্ট তৈরি করুন"
                >
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition" />
                    <span>নতুন একাউন্ট (Sign Up)</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                </a>

                {/* Official Website */}
                <a
                  href={BANGLADESH_COURIERS[selectedCourier].website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 rounded-xl font-black text-slate-950 transition shadow-2xs group cursor-pointer"
                  title="অফিসিয়াল ওয়েবসাইট ভিজিট করুন"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600 group-hover:scale-110 transition" />
                    <span>অফিশিয়াল ওয়েবসাইট</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                </a>
              </div>

              {/* Extra Support Info */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-1 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>সাপোর্ট সময়: {BANGLADESH_COURIERS[selectedCourier].supportHours}</span>
                </span>
                <a
                  href={`mailto:${BANGLADESH_COURIERS[selectedCourier].email}`}
                  className="hover:text-emerald-600 flex items-center gap-1 text-slate-700 font-mono"
                >
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>{BANGLADESH_COURIERS[selectedCourier].email}</span>
                </a>
              </div>
            </div>
          ) : selectedCourier === 'manual' ? (
            <div className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-950 flex items-center gap-2">
                  <span>সুন্দরবন ও এসএ পরিবহন হেল্পলাইন ও ওয়েবসাইট</span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href="https://sundarbancourierltd.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white border border-amber-200 rounded-xl flex items-center justify-between font-bold text-slate-900"
                >
                  <span>সুন্দরবন কুরিয়ার ওয়েবসাইট</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                </a>
                <a
                  href="tel:09612004455"
                  className="p-2.5 bg-white border border-amber-200 rounded-xl flex items-center justify-between font-bold text-slate-900"
                >
                  <span>সুন্দরবন হেল্পলাইন: 09612-004455</span>
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                </a>
              </div>
            </div>
          ) : null}

          {/* Manual courier provider name input */}
          {selectedCourier === 'manual' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  কুরিয়ার কোম্পানির নাম:
                </label>
                <input
                  type="text"
                  value={customCourierName}
                  onChange={(e) => setCustomCourierName(e.target.value)}
                  placeholder="যেমন: Sundarban Courier / SA Paribahan"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  কুরিয়ার রিসিট / ট্র্যাকিং নম্বর (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  value={manualTrackingCode}
                  onChange={(e) => setManualTrackingCode(e.target.value)}
                  placeholder="যেমন: CN-89472"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>
          )}

          {/* RECIPIENT INFORMATION (AUTO-FILLED) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
              <span>প্রাপকের তথ্য (Recipient Information - স্বয়ংক্রিয়ভাবে পূরণকৃত)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  গ্রাহকের নাম:
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 text-slate-950 font-bold rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  মোবাইল নম্বর:
                </label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 text-slate-950 font-mono font-bold rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                সম্পূর্ণ ডেলিভারি ঠিকানা ও জেলা:
              </label>
              <textarea
                rows={2}
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 text-slate-950 font-medium rounded-xl"
              />
            </div>
          </div>

          {/* COD COLLECTION & NOTE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1">
              <label className="block text-[11px] font-black text-amber-950">
                ক্যাশ অন ডেলিভারি কালেকশন (COD Amount):
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={codAmount}
                  onChange={(e) => setCodAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 pl-8 bg-white border border-amber-300 text-slate-950 font-black rounded-xl"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">৳</span>
              </div>
              <p className="text-[10px] text-amber-900 font-semibold">
                {order.paymentStatus === 'Paid'
                  ? '💡 গ্রাহক অনলাইন/বিকাশে আগেই পে করেছেন। COD ৳০ টাকা রাখা হয়েছে।'
                  : `💡 কুরিয়ার গ্রাহকের থেকে ডেলিভারির সময় মোট ৳${codAmount} সংগ্রহ করবে।`}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                ডেলিভারিম্যানের জন্য বিশেষ নির্দেশ (Note):
              </label>
              <input
                type="text"
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                placeholder="যেমন: ভঙ্গুর পণ্য / ডেলিভারির আগে কল করবেন"
                className="w-full text-xs p-2.5 bg-white border border-slate-300 text-slate-950 font-medium rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            বন্ধ করুন
          </button>

          <button
            type="button"
            onClick={handleConfirmBooking}
            disabled={isBooking}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-md shadow-amber-400/20 cursor-pointer disabled:opacity-50"
          >
            <Truck className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isBooking
                ? 'কুরিয়ারে বুকিং হচ্ছে...'
                : bookedResult
                ? 'পুনরায় কুরিয়ারে বুক করুন (Re-Book)'
                : `${
                    selectedCourier === 'steadfast'
                      ? 'স্টেডফাস্টে'
                      : selectedCourier === 'pathao'
                      ? 'পাঠাও-তে'
                      : selectedCourier === 'redx'
                      ? 'রেডএক্সে'
                      : 'কুরিয়ারে'
                  } পার্সেল পাঠান`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
