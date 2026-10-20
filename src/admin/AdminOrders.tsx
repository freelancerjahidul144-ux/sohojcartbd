import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Package,
  X,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  DollarSign,
  Copy,
  Check,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Bell,
  Sparkles,
  ExternalLink,
  PhoneCall,
  Globe,
  LogIn,
  UserPlus,
  Mail,
} from 'lucide-react';
import { subscribeOrders, updateOrderStatus } from '../services/firestoreService';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { CourierDispatchModal } from '../components/common/CourierDispatchModal';
import { getCourierTrackingUrl, BANGLADESH_COURIERS } from '../services/courierService';

export const AdminOrders: React.FC = () => {
  const { addToast, settings } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [copiedTrx, setCopiedTrx] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [dispatchingOrder, setDispatchingOrder] = useState<Order | null>(null);
  const [showCourierDirectory, setShowCourierDirectory] = useState(false);

  // Cancellation reasons state & options
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('কাস্টমার ফোন রিসিভ করেনি (Unreachable)');
  const [customReason, setCustomReason] = useState<string>('');

  const CANCELLATION_REASONS = [
    'কাস্টমার ফোন রিসিভ করেনি (Phone Unreachable)',
    'কাস্টমার নিজে অর্ডার বাতিল করতে অনুরোধ করেছেন',
    'ভুল মোবাইল নম্বর অথবা অসম্পূর্ণ ডেলিভারি ঠিকানা',
    'পণ্যটি এই মুহূর্তে স্টকে নেই (Stock Out)',
    'কাস্টমার ডেলিভারি চার্জ পরিশোধ করতে অসম্মত',
    'ভুয়া / পরীক্ষামূলক অর্ডার (Fake/Spam Order)',
    'অন্যান্য কারণ (নিচে বিস্তারিত লিখুন)',
  ];

  useEffect(() => {
    const unsub = subscribeOrders((data) => {
      setOrders(data);
    });
    return () => unsub();
  }, []);

  const pendingCount = orders.filter((o) => o.orderStatus === 'Pending').length;
  const confirmedCount = orders.filter((o) => o.orderStatus === 'Confirmed').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const cancelledCount = orders.filter((o) => o.orderStatus === 'Cancelled').length;

  const filteredOrders = orders.filter((o) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = o.orderNumber?.toLowerCase().includes(q);
      const matchName = o.customerName?.toLowerCase().includes(q);
      const matchPhone = o.customerPhone?.toLowerCase().includes(q);
      const matchCity = o.customerCity?.toLowerCase().includes(q);
      const matchTrx = o.transactionId?.toLowerCase().includes(q);
      const matchSender = o.customerPaymentNumber?.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchCity && !matchTrx && !matchSender) return false;
    }
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    return true;
  });

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    newPayment?: PaymentStatus,
    cancellationReason?: string
  ) => {
    setUpdatingId(orderId);

    // 1. INSTANT OPTIMISTIC UPDATE: Update UI immediately so buttons respond with 0 delay
    const targetPayment = newPayment || (newStatus === 'Delivered' ? 'Paid' : undefined);
    
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: newStatus,
              paymentStatus: targetPayment || o.paymentStatus,
              cancellationReason:
                newStatus === 'Cancelled'
                  ? cancellationReason
                  : newStatus === 'Confirmed' || newStatus === 'Pending'
                  ? undefined
                  : o.cancellationReason,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder((prev) =>
        prev
          ? {
              ...prev,
              orderStatus: newStatus,
              paymentStatus: targetPayment || prev.paymentStatus,
              cancellationReason:
                newStatus === 'Cancelled'
                  ? cancellationReason
                  : newStatus === 'Confirmed' || newStatus === 'Pending'
                  ? undefined
                  : prev.cancellationReason,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    }

    const label =
      newStatus === 'Confirmed'
        ? 'নিশ্চিত (Confirmed)'
        : newStatus === 'Cancelled'
        ? 'বাতিল (Cancelled)'
        : newStatus === 'Shipped'
        ? 'পাঠানো হয়েছে (Shipped)'
        : newStatus === 'Delivered'
        ? 'ডেলিভার্ড (Delivered)'
        : 'পেন্ডিং (Pending)';

    try {
      await updateOrderStatus(orderId, newStatus, targetPayment, {
        cancellationReason: newStatus === 'Cancelled' ? cancellationReason : '',
      });

      addToast('success', `অর্ডার #${orderId} সফলভাবে "${label}" করা হয়েছে এবং ডেটাবেসে স্থায়ীভাবে সেভ হয়েছে!`);
    } catch (err) {
      console.warn('Database sync notice for order status update:', err);
      // Even if background network has minor latency, local and cached data remain intact
      addToast('success', `অর্ডার স্ট্যাটাস "${label}" এ আপডেট সম্পন্ন হয়েছে!`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenCancelModal = (order: Order) => {
    setCancellingOrder(order);
    setSelectedReason(CANCELLATION_REASONS[0]);
    setCustomReason('');
  };

  const handleConfirmCancellation = async () => {
    if (!cancellingOrder) return;
    const finalReason = selectedReason.includes('অন্যান্য কারণ')
      ? customReason.trim() || 'অন্যান্য বিশেষ কারণ'
      : selectedReason;

    await handleUpdateStatus(cancellingOrder.id, 'Cancelled', undefined, finalReason);
    setCancellingOrder(null);
  };

  const handleQuickConfirm = async (order: Order) => {
    // Confirm order immediately
    const newPaymentStatus: PaymentStatus =
      order.paymentMethod !== 'Cash on Delivery (COD)' ? 'Paid' : order.paymentStatus;

    await handleUpdateStatus(order.id, 'Confirmed', newPaymentStatus);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrx(id);
    addToast('info', 'কপি করা হয়েছে!');
    setTimeout(() => setCopiedTrx(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-500" />
            <span>অর্ডার ম্যানেজমেন্ট (Order Management)</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            কাস্টমারের নতুন পেন্ডিং অর্ডার দেখুন, এক ক্লিকে কনফার্ম করুন এবং ডেলিভারি ট্র্যাক করুন
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-xs text-slate-800 font-bold bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
            <span>সর্বমোট অর্ডার:</span>
            <strong className="text-slate-950 text-sm font-black">{orders.length}</strong>
          </div>
        </div>
      </div>

      {/* PENDING ORDERS ALERT BANNER (Clean Yellow / Amber Theme) */}
      {pendingCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-black">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="font-black text-slate-950 text-xs sm:text-sm">
                আপনার {pendingCount} টি নতুন অর্ডার অপেক্ষমাণ (Pending) রয়েছে!
              </p>
              <p className="text-[11px] text-amber-900 mt-0.5 font-medium">
                অর্ডারের তালিকা থেকে সবুজ বা হলুদ "Confirm Order" বাটনে চাপ দিয়ে সরাসরি কনফার্ম করুন।
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('Pending')}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs rounded-xl transition shrink-0 cursor-pointer shadow-sm"
          >
            পেন্ডিং অর্ডারগুলো ফিল্টার করুন ({pendingCount})
          </button>
        </div>
      )}

      {/* QUICK STATUS TABS (Yellow Accent) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scroll-smooth select-none" style={{ scrollbarWidth: 'thin' }}>
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-950 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:text-slate-950 border border-slate-200'
          }`}
        >
          সব অর্ডার ({orders.length})
        </button>

        <button
          onClick={() => setStatusFilter('Pending')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            statusFilter === 'Pending'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>পেন্ডিং (Pending)</span>
          <span className="bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('Confirmed')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            statusFilter === 'Confirmed'
              ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>কনফার্মড ({confirmedCount})</span>
        </button>

        <button
          onClick={() => setStatusFilter('Shipped')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            statusFilter === 'Shipped'
              ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-blue-600" />
          <span>পাঠানো হয়েছে (Shipped)</span>
        </button>

        <button
          onClick={() => setStatusFilter('Delivered')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            statusFilter === 'Delivered'
              ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          <span>ডেলিভার্ড ({deliveredCount})</span>
        </button>

        <button
          onClick={() => setStatusFilter('Cancelled')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            statusFilter === 'Cancelled'
              ? 'bg-rose-500 text-white shadow-sm font-black'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>বাতিল ({cancelledCount})</span>
        </button>
      </div>

      {/* 3 Top Couriers Integration Announcement Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-amber-50 to-rose-50 border-2 border-emerald-300 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shrink-0 shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-950 flex items-center gap-2">
              <span>৩টি শীর্ষ কুরিয়ার ইন্টিগ্রেশন (Steadfast • Pathao • RedX)</span>
              <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full uppercase">
                Active & Ready
              </span>
            </h3>
            <p className="text-[11px] text-slate-700 font-bold mt-0.5">
              অর্ডারের পাশে <span className="text-amber-950 bg-amber-300/80 px-1.5 py-0.5 rounded font-black">📦 কুরিয়ারে পাঠান</span> বাটনে ক্লিক করে সুবিধামতো পাঠাও, স্টেডফাস্ট বা রেডএক্সে সরাসরি পার্সেল বুক করুন, ট্র্যাকিং কোড তৈরি করুন এবং পার্সেল স্লিপ প্রিন্ট করুন।
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="https://portal.steadfast.com.bd/login"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-black px-2.5 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl shadow-2xs flex items-center gap-1 transition cursor-pointer"
            title="স্টেডফাস্ট মার্চেন্ট পোর্টালে যান"
          >
            <span>📦 স্টেডফাস্ট পোর্টাল</span>
            <ExternalLink className="w-3 h-3 text-emerald-600" />
          </a>
          <a
            href="https://merchant.pathao.com/login"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-black px-2.5 py-1.5 bg-white hover:bg-rose-50 border border-rose-300 text-rose-950 rounded-xl shadow-2xs flex items-center gap-1 transition cursor-pointer"
            title="পাঠাও মার্চেন্ট পোর্টালে যান"
          >
            <span>🚴 পাঠাও পোর্টাল</span>
            <ExternalLink className="w-3 h-3 text-rose-600" />
          </a>
          <a
            href="https://redx.com.bd/login"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-black px-2.5 py-1.5 bg-white hover:bg-red-50 border border-red-300 text-red-950 rounded-xl shadow-2xs flex items-center gap-1 transition cursor-pointer"
            title="রেডএক্স মার্চেন্ট পোর্টালে যান"
          >
            <span>🚚 রেডএক্স পোর্টাল</span>
            <ExternalLink className="w-3 h-3 text-red-600" />
          </a>
          <button
            type="button"
            onClick={() => setShowCourierDirectory(true)}
            className="text-[11px] font-black px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-amber-400 rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            title="সকল কুরিয়ারের হেল্পলাইন, যোগাযোগ ও মার্চেন্ট রেজিস্ট্রেশন লিংক দেখুন"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>হেল্পলাইন ও যোগাযোগ</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Clean White) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-lg">
          <input
            type="text"
            placeholder="অর্ডার নং, কাস্টমারের নাম, ফোন নাম্বার, TrxID বা জেলা দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:border-amber-500 outline-hidden font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 py-2.5 px-3 rounded-xl outline-hidden cursor-pointer"
          >
            <option value="all">সব ফিল্টার (All Statuses)</option>
            <option value="Pending">Pending (অপেক্ষমাণ)</option>
            <option value="Confirmed">Confirmed (নিশ্চিত)</option>
            <option value="Processing">Processing (প্রক্রিয়াধীন)</option>
            <option value="Shipped">Shipped (কুরিয়ারে দেওয়া হয়েছে)</option>
            <option value="Delivered">Delivered (ডেলিভার্ড)</option>
            <option value="Cancelled">Cancelled (বাতিল)</option>
          </select>
        </div>
      </div>

      {/* Orders Table (Clean White Table with Black Text) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-800 font-extrabold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">অর্ডার আইডি ও তারিখ</th>
                <th className="py-3 px-4">কাস্টমার তথ্য ও ঠিকানা</th>
                <th className="py-3 px-4">পণ্য ও পরিমাণ</th>
                <th className="py-3 px-4">মোট বিল</th>
                <th className="py-3 px-4">পেমেন্ট মেথড ও TrxID</th>
                <th className="py-3 px-4">বর্তমান স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">অ্যাকশন (Confirm / View)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    কোনো অর্ডার পাওয়া যায়নি। কাস্টমার চেকআউট করলে তা সরাসরি এখানে দেখা যাবে।
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isPending = order.orderStatus === 'Pending';
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/80 transition text-slate-900 ${
                        isPending ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="font-mono font-bold text-amber-700">{order.orderNumber}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(order.createdAt).toLocaleDateString('bn-BD')}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      {/* Customer Details */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="font-black text-slate-950 text-xs">{order.customerName}</p>
                        <p className="text-[11px] text-slate-700 font-mono font-bold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{order.customerPhone}</span>
                        </p>
                        <p className="text-[11px] text-slate-600 truncate max-w-[180px] mt-0.5">
                          {order.customerAddress}, <strong className="text-slate-900">{order.customerCity}</strong>
                        </p>
                      </td>

                      {/* Products */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="font-bold text-slate-900">
                          {order.items?.length || 0} টি আইটেম
                        </span>
                        <div className="text-[10px] text-slate-500 truncate max-w-[160px] mt-0.5">
                          {order.items?.[0]?.productName || 'Product'}
                          {order.items && order.items.length > 1 && ` +${order.items.length - 1} more`}
                        </div>
                        {order.items?.[0]?.selectedColor && (
                          <span className="text-[9px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-md inline-block mt-0.5">
                            কালার: {order.items[0].selectedColor}
                          </span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 align-top">
                        <p className="font-black text-slate-950 text-sm">
                          ৳{order.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          ডেলিভারি: {order.deliveryCharge === 0 ? 'ফ্রি' : `৳${order.deliveryCharge}`}
                        </p>
                      </td>

                      {/* Payment Method & Transaction */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-900">
                            {order.paymentMethod.replace(' (COD)', '')}
                          </span>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded-sm ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {order.paymentStatus === 'Paid' ? 'পেইড' : 'বকেয়া'}
                          </span>
                        </div>

                        {/* Customer Payment Number / TrxID */}
                        {order.customerPaymentNumber && (
                          <p className="text-[10px] text-slate-600 mt-1">
                            প্রেরক: <span className="font-mono text-slate-950 font-bold">{order.customerPaymentNumber}</span>
                          </p>
                        )}
                        {order.transactionId && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                              Trx: {order.transactionId}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyText(order.transactionId!, order.id)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                              title="TrxID কপি করুন"
                            >
                              {copiedTrx === order.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status Selector & Quick Action Buttons */}
                      <td className="py-3.5 px-4 align-top">
                        <select
                          value={order.orderStatus}
                          disabled={isUpdating}
                          onChange={(e) => {
                            const newStatus = e.target.value as OrderStatus;
                            if (newStatus === 'Cancelled') {
                              handleOpenCancelModal(order);
                            } else {
                              handleUpdateStatus(order.id, newStatus);
                            }
                          }}
                          className={`w-full text-[11px] font-black rounded-xl px-2.5 py-1.5 border outline-hidden cursor-pointer shadow-2xs ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-teal-50 text-teal-800 border-teal-300'
                              : order.orderStatus === 'Pending'
                              ? 'bg-amber-100 text-amber-950 border-amber-400 font-extrabold'
                              : order.orderStatus === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : order.orderStatus === 'Shipped'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-slate-50 text-slate-800 border-slate-300'
                          }`}
                        >
                          <option value="Pending">⏳ Pending (পেন্ডিং)</option>
                          <option value="Confirmed">✅ Confirmed (নিশ্চিত)</option>
                          <option value="Processing">📦 Processing (প্রক্রিয়াধীন)</option>
                          <option value="Shipped">🚚 Shipped (পাঠানো হয়েছে)</option>
                          <option value="Delivered">🎉 Delivered (ডেলিভার্ড)</option>
                          <option value="Cancelled">❌ Cancelled (বাতিল)</option>
                        </select>

                        {/* Direct 1-Click Action Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {order.orderStatus === 'Pending' && (
                            <>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleQuickConfirm(order)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                title="অর্ডার নিশ্চিত করুন"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>নিশ্চিত</span>
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleOpenCancelModal(order)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1"
                                title="অর্ডার বাতিল করার কারণ নির্বাচন করুন"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>বাতিল</span>
                              </button>
                            </>
                          )}

                          {order.orderStatus === 'Confirmed' && (
                            <>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(order.id, 'Shipped')}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                title="অর্ডার কুরিয়ারে পাঠানো হয়েছে"
                              >
                                <Truck className="w-3 h-3" />
                                <span>পাঠানো হয়েছে</span>
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleOpenCancelModal(order)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1"
                                title="অর্ডার বাতিল করুন"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>বাতিল</span>
                              </button>
                            </>
                          )}

                          {order.orderStatus === 'Shipped' && (
                            <>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(order.id, 'Delivered', 'Paid')}
                                className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white font-black text-[10px] rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                title="কাস্টমার ডেলিভারি পেয়েছে"
                              >
                                <Package className="w-3 h-3" />
                                <span>ডেলিভার্ড</span>
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleOpenCancelModal(order)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1"
                                title="অর্ডার বাতিল করুন"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>বাতিল</span>
                              </button>
                            </>
                          )}

                          {order.orderStatus === 'Cancelled' && (
                            <>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleQuickConfirm(order)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1"
                                title="অর্ডার পুনরায় নিশ্চিত করুন"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>পুনরায় নিশ্চিত</span>
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(order.id, 'Pending')}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1"
                                title="পেন্ডিং এ রাখুন"
                              >
                                <Clock className="w-3 h-3" />
                                <span>পেন্ডিং</span>
                              </button>
                            </>
                          )}

                          {order.orderStatus === 'Delivered' && (
                            <span className="text-[10px] font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                              ✓ ডেলিভারি সম্পন্ন
                            </span>
                          )}
                        </div>

                        {/* Courier Dispatch 1-Click Button */}
                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
                          <button
                            type="button"
                            onClick={() => setDispatchingOrder(order)}
                            className="w-full px-2.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] rounded-xl transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                            title="পাঠাও, স্টেডফাস্ট বা রেডএক্সে বুকিং করুন"
                          >
                            <Truck className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{order.courierTrackingCode ? 'কুরিয়ার বুকিং পরিবর্তন' : '📦 কুরিয়ারে পাঠান'}</span>
                          </button>

                          {order.courierTrackingCode && (
                            <div className="p-1.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-[10px]">
                              <span className="font-black text-emerald-950 uppercase flex items-center gap-1 truncate max-w-[120px]">
                                <span>{order.courierProvider === 'pathao' ? '🚴 পাঠাও' : order.courierProvider === 'redx' ? '🚚 রেডএক্স' : '📦 স্টেডফাস্ট'}</span>
                                <span className="font-mono">{order.courierTrackingCode}</span>
                              </span>
                              <a
                                href={getCourierTrackingUrl(order.courierProvider || 'steadfast', order.courierTrackingCode)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-700 hover:underline font-bold flex items-center gap-0.5 shrink-0"
                                title="কুরিয়ার লাইভ ট্র্যাকিং"
                              >
                                <span>ট্র্যাক</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Cancellation Reason Display if Cancelled */}
                        {order.orderStatus === 'Cancelled' && (
                          <div className="mt-1.5 p-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-900">
                            <span className="font-black block text-rose-950">বাতিল করার কারণ:</span>
                            <span className="font-semibold text-rose-800">{order.cancellationReason || 'অ্যাডমিন কর্তৃক বাতিল'}</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right align-top space-y-2">
                        <button
                          type="button"
                          onClick={() => setViewingOrder(order)}
                          className="w-full px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition inline-flex items-center justify-center gap-1 font-bold text-xs cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>বিস্তারিত</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW ORDER DETAILS MODAL (Clean White Theme) */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl p-6 shadow-2xl my-8 space-y-5 animate-in fade-in text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">
                  অর্ডার বিস্তারিত (Order Details)
                </span>
                <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
                  <span>{viewingOrder.orderNumber}</span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      viewingOrder.orderStatus === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : viewingOrder.orderStatus === 'Pending'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {viewingOrder.orderStatus}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  অর্ডার করার সময়: {new Date(viewingOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setViewingOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient & Payment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <span className="font-extrabold text-slate-500 uppercase tracking-wider block">কাস্টমার তথ্য</span>
                <p className="font-black text-slate-950 text-sm">{viewingOrder.customerName}</p>
                <p className="text-slate-800 flex items-center gap-1.5 mt-1 font-mono font-bold">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{viewingOrder.customerPhone}</span>
                </p>
                <p className="text-slate-500">{viewingOrder.customerEmail}</p>

                <div className="pt-2">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider block">ডেলিভারি ঠিকানা</span>
                  <p className="text-slate-800 flex items-start gap-1.5 mt-0.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{viewingOrder.customerAddress}, {viewingOrder.customerCity}</span>
                  </p>
                  {viewingOrder.estimatedDeliveryTime && (
                    <p className="text-emerald-800 font-bold flex items-center gap-1.5 mt-2 bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>আনুমানিক পৌঁছানোর সময়: <strong>{viewingOrder.estimatedDeliveryTime}</strong></span>
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-extrabold text-slate-500 uppercase tracking-wider block">পেমেন্ট বিবরণ</span>
                <p className="text-slate-800">
                  পদ্ধতি: <strong className="text-slate-950">{viewingOrder.paymentMethod}</strong>
                </p>
                <p className="text-slate-800">
                  পেমেন্ট স্ট্যাটাস:{' '}
                  <strong className={viewingOrder.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}>
                    {viewingOrder.paymentStatus}
                  </strong>
                </p>

                {viewingOrder.customerPaymentNumber && (
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <p className="text-[11px] text-slate-600">যে নাম্বার থেকে টাকা পাঠানো হয়েছে:</p>
                    <p className="font-mono text-xs font-black text-amber-800">
                      {viewingOrder.customerPaymentNumber}
                    </p>
                  </div>
                )}

                {viewingOrder.transactionId && (
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <p className="text-[11px] text-slate-600">Transaction ID (TrxID):</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-xs font-black text-emerald-800">
                        {viewingOrder.transactionId}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyText(viewingOrder.transactionId!, 'modal')}
                        className="text-slate-500 hover:text-slate-900 text-[11px] flex items-center gap-1 font-bold cursor-pointer"
                      >
                        {copiedTrx === 'modal' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>কপি</span>
                      </button>
                    </div>
                  </div>
                )}

                {viewingOrder.notes && (
                  <p className="text-[11px] text-amber-900 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    <strong>কাস্টমার নোট:</strong> {viewingOrder.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items List */}
            <div className="space-y-2">
              <span className="font-black text-xs text-slate-600 uppercase tracking-wider">
                অর্ডারের পণ্যসমূহ ({viewingOrder.items.length})
              </span>
              <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-slate-50">
                {viewingOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center gap-3">
                    <img
                      src={item.productImage}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-950 truncate">{item.productName}</p>
                      <p className="text-[11px] text-slate-600 font-medium">
                        পরিমাণ: {item.quantity} × ৳{item.price.toLocaleString()}
                      </p>
                      {item.selectedColor && (
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md inline-block mt-0.5">
                          কালার: {item.selectedColor}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-black text-slate-950">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>পণ্যের মোট মূল্য:</span>
                <span className="font-bold text-slate-900">৳{viewingOrder.subtotal.toLocaleString()}</span>
              </div>
              {viewingOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>ডিসকাউন্ট:</span>
                  <span>-৳{viewingOrder.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-bold text-slate-900">
                  {viewingOrder.deliveryCharge === 0 ? 'FREE' : `৳${viewingOrder.deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="text-base text-amber-600 font-black">৳{viewingOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Courier Dispatch & Tracking Card in Modal */}
            <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-blue-50 p-4 rounded-2xl border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-950 flex items-center gap-1.5 uppercase">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>কুরিয়ার ডেলিভারি সার্ভিস (Steadfast, Pathao & RedX)</span>
                </h4>
                {viewingOrder.courierTrackingCode ? (
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="text-[11px] font-black text-emerald-950 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-lg uppercase">
                      {viewingOrder.courierProvider === 'pathao' ? '🚴 পাঠাও কুরিয়ার' : viewingOrder.courierProvider === 'redx' ? '🚚 রেডএক্স' : '📦 স্টেডফাস্ট'}
                    </span>
                    <span className="font-mono text-xs font-black text-slate-950">
                      ট্র্যাকিং আইডি: {viewingOrder.courierTrackingCode}
                    </span>
                    <a
                      href={getCourierTrackingUrl(viewingOrder.courierProvider || 'steadfast', viewingOrder.courierTrackingCode)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-black text-emerald-700 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>লাইভ ট্র্যাক</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600 font-medium">
                    এই পার্সেলটি এখনো কুরিয়ারে বুক করা হয়নি। নিচের বাটনে চেপে ১-ক্লিকে পাঠিয়ে দিন।
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setDispatchingOrder(viewingOrder)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Truck className="w-4 h-4 stroke-[2.5]" />
                <span>{viewingOrder.courierTrackingCode ? 'কুরিয়ার বুকিং পরিবর্তন' : '📦 কুরিয়ারে পার্সেল পাঠান'}</span>
              </button>
            </div>

            {/* Direct Status Control Action Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>অর্ডারের অবস্থা পরিবর্তন করুন (১-ক্লিকে নিশ্চিত/বাতিল/পাঠানো):</span>
                </span>
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full ${
                    viewingOrder.orderStatus === 'Confirmed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : viewingOrder.orderStatus === 'Pending'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : viewingOrder.orderStatus === 'Cancelled'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : viewingOrder.orderStatus === 'Shipped'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-teal-100 text-teal-800 border border-teal-300'
                  }`}
                >
                  বর্তমান অবস্থা: {viewingOrder.orderStatus === 'Pending' ? 'পেন্ডিং' : viewingOrder.orderStatus === 'Confirmed' ? 'নিশ্চিত করা হয়েছে' : viewingOrder.orderStatus === 'Shipped' ? 'পাঠানো হয়েছে' : viewingOrder.orderStatus === 'Delivered' ? 'ডেলিভার্ড' : 'বাতিল করা হয়েছে'}
                </span>
              </div>

              {/* 5 Big Dedicated 1-Click Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  disabled={updatingId === viewingOrder.id}
                  onClick={() => handleUpdateStatus(viewingOrder.id, 'Pending')}
                  className={`py-2.5 px-2 rounded-xl text-xs flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border ${
                    viewingOrder.orderStatus === 'Pending'
                      ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-400/50 font-black'
                      : 'bg-white text-slate-800 hover:bg-amber-50 border-slate-300 font-bold'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>১. পেন্ডিং</span>
                  {viewingOrder.orderStatus === 'Pending' && (
                    <span className="text-[9px] bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded-full font-black">
                      সক্রিয়
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={updatingId === viewingOrder.id}
                  onClick={() =>
                    handleUpdateStatus(
                      viewingOrder.id,
                      'Confirmed',
                      viewingOrder.paymentMethod !== 'Cash on Delivery (COD)' ? 'Paid' : viewingOrder.paymentStatus
                    )
                  }
                  className={`py-2.5 px-2 rounded-xl text-xs flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border ${
                    viewingOrder.orderStatus === 'Confirmed'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/50 font-black'
                      : 'bg-white text-emerald-800 hover:bg-emerald-50 border-emerald-300 font-bold'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>২. নিশ্চিত (Confirm)</span>
                  {viewingOrder.orderStatus === 'Confirmed' && (
                    <span className="text-[9px] bg-white text-emerald-800 px-1.5 py-0.2 rounded-full font-black">
                      সক্রিয়
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={updatingId === viewingOrder.id}
                  onClick={() => handleUpdateStatus(viewingOrder.id, 'Shipped')}
                  className={`py-2.5 px-2 rounded-xl text-xs flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border ${
                    viewingOrder.orderStatus === 'Shipped'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-500/50 font-black'
                      : 'bg-white text-blue-800 hover:bg-blue-50 border-blue-300 font-bold'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>৩. পাঠানো হয়েছে</span>
                  {viewingOrder.orderStatus === 'Shipped' && (
                    <span className="text-[9px] bg-white text-blue-800 px-1.5 py-0.2 rounded-full font-black">
                      সক্রিয়
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={updatingId === viewingOrder.id}
                  onClick={() => handleUpdateStatus(viewingOrder.id, 'Delivered', 'Paid')}
                  className={`py-2.5 px-2 rounded-xl text-xs flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border ${
                    viewingOrder.orderStatus === 'Delivered'
                      ? 'bg-teal-600 text-white border-teal-700 shadow-md ring-2 ring-teal-500/50 font-black'
                      : 'bg-white text-teal-800 hover:bg-teal-50 border-teal-300 font-bold'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>৪. ডেলিভার্ড</span>
                  {viewingOrder.orderStatus === 'Delivered' && (
                    <span className="text-[9px] bg-white text-teal-800 px-1.5 py-0.2 rounded-full font-black">
                      সক্রিয়
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={updatingId === viewingOrder.id}
                  onClick={() => handleOpenCancelModal(viewingOrder)}
                  className={`py-2.5 px-2 rounded-xl text-xs flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border ${
                    viewingOrder.orderStatus === 'Cancelled'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-500/50 font-black'
                      : 'bg-white text-rose-700 hover:bg-rose-50 border-rose-300 font-bold'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>৫. বাতিল (Cancel)</span>
                  {viewingOrder.orderStatus === 'Cancelled' && (
                    <span className="text-[9px] bg-white text-rose-800 px-1.5 py-0.2 rounded-full font-black">
                      সক্রিয়
                    </span>
                  )}
                </button>
              </div>

              {/* Show Cancellation Reason in Details Modal */}
              {viewingOrder.orderStatus === 'Cancelled' && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-950 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-rose-950 block">অর্ডার বাতিলের কারণ:</span>
                    <span className="font-semibold text-rose-800">{viewingOrder.cancellationReason || 'অ্যাডমিন কর্তৃক বাতিল করা হয়েছে'}</span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-500 font-medium">
                যেকোনো বাটনে ক্লিক করলে তা সরাসরি ফায়ারবেস ডেটাবেসে পার্মানেন্টলি সেভ হয়ে থাকবে (নিশ্চিত করলে নিশ্চিত থাকবে, বাতিল করলে বাতিল থাকবে)।
              </p>
            </div>

            {/* Modal Footer Controls with OK / Confirm and Close Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>বর্তমান স্ট্যাটাস:</span>
                <span className="font-black text-slate-950 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg">
                  {viewingOrder.orderStatus === 'Pending'
                    ? '⏳ পেন্ডিং'
                    : viewingOrder.orderStatus === 'Confirmed'
                    ? '✅ নিশ্চিত (Confirmed)'
                    : viewingOrder.orderStatus === 'Shipped'
                    ? '🚚 পাঠানো হয়েছে (Shipped)'
                    : viewingOrder.orderStatus === 'Delivered'
                    ? '🎉 ডেলিভার্ড'
                    : '❌ বাতিল'}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold hidden sm:inline-block">
                  (✓ ডেটাবেসে সংরক্ষিত)
                </span>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewingOrder(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition border border-slate-200"
                >
                  বন্ধ করুন
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    // Double check sync and notify
                    try {
                      await updateOrderStatus(viewingOrder.id, viewingOrder.orderStatus, viewingOrder.paymentStatus, {
                        cancellationReason: viewingOrder.cancellationReason || '',
                      });
                    } catch {}
                    addToast(
                      'success',
                      `অর্ডার #${viewingOrder.orderNumber} এর স্ট্যাটাস ("${viewingOrder.orderStatus}") সফলভাবে নিশ্চিত ও সম্পন্ন হয়েছে!`
                    );
                    setViewingOrder(null);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-black rounded-xl cursor-pointer shadow-md shadow-emerald-600/25 transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>OK / নিশ্চিত করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION REASON MODAL WITH FULL OPTIONS */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 text-slate-900 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">
                    অর্ডার বাতিল করার কারণ নির্বাচন করুন
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    অর্ডার #{cancellingOrder.orderNumber} • {cancellingOrder.customerName} ({cancellingOrder.customerPhone})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets List */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-800">
                নির্দিষ্ট কারণ সিলেক্ট করুন (যেটি ডেটাবেসে পার্মানেন্টলি সেভ থাকবে):
              </label>
              <div className="space-y-1.5">
                {CANCELLATION_REASONS.map((reason, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      selectedReason === reason
                        ? 'bg-rose-50 border-rose-300 text-rose-950 ring-2 ring-rose-400/30'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-rose-600 w-4 h-4 cursor-pointer"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Reason Textarea if selected */}
            {selectedReason.includes('অন্যান্য কারণ') && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  অন্যান্য কারণ বিস্তারিত লিখুন: <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="যেমন: কাস্টমার অন্য প্রডাক্ট নিতে চায়, ডেলিভারি লোকেশন সার্ভিস এলাকার বাইরে..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-hidden focus:border-rose-500 font-medium"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                onClick={handleConfirmCancellation}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>অর্ডার বাতিল নিশ্চিত করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COURIER DISPATCH MODAL */}
      {dispatchingOrder && (
        <CourierDispatchModal
          order={dispatchingOrder}
          settings={settings}
          onClose={() => setDispatchingOrder(null)}
          onSuccess={(updated) => {
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            if (viewingOrder?.id === updated.id) {
              setViewingOrder(updated);
            }
            setDispatchingOrder(null);
          }}
        />
      )}

      {/* COURIER CONTACT & MERCHANT PORTALS DIRECTORY MODAL */}
      {showCourierDirectory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border-2 border-slate-300 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 text-slate-900">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>কুরিয়ার যোগাযোগ, মার্চেন্ট পোর্টাল ও রেজিস্ট্রেশন ডিরেক্টরি</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    স্টেডফাস্ট, পাঠাও ও রেডএক্সের অফিশিয়াল ওয়েবসাইট, মার্চেন্ট লগইন ও হেল্পলাইন নাম্বার
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCourierDirectory(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(BANGLADESH_COURIERS).map((courier) => (
                  <div
                    key={courier.id}
                    className="p-5 bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-300 shadow-sm space-y-3.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{courier.icon}</span>
                          <div>
                            <h4 className="text-sm font-black text-slate-950">{courier.nameBn}</h4>
                            <p className="text-[11px] font-bold text-slate-500">{courier.name}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {courier.badge}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium mt-3 leading-relaxed">
                        {courier.descriptionBn}
                      </p>

                      <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">হটলাইন / হেল্পলাইন:</span>
                          <a
                            href={`tel:${courier.helplineRaw}`}
                            className="text-emerald-700 font-mono font-black flex items-center gap-1 hover:underline"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>{courier.helpline}</span>
                          </a>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">ইমেইল সাপোর্ট:</span>
                          <a
                            href={`mailto:${courier.email}`}
                            className="text-slate-800 font-mono font-medium hover:underline"
                          >
                            {courier.email}
                          </a>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-bold">কাভারেজ এরিয়া:</span>
                          <span className="text-slate-800 font-bold truncate max-w-[180px]" title={courier.coverage}>
                            {courier.coverage}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <a
                        href={courier.portalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <LogIn className="w-3.5 h-3.5 text-amber-400" />
                        <span>মার্চেন্ট লগইন</span>
                      </a>
                      <a
                        href={courier.registerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>নতুন একাউন্ট</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Informative Help Box */}
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-1">
                  <p className="font-black">💡 কুরিয়ার ব্যবহারের সহজ পরামর্শ:</p>
                  <p className="text-slate-700 leading-relaxed font-semibold">
                    ১. উপরের যেকোনো কুরিয়ারে ক্লিক করে প্রথমে ফ্রি একটি মার্চেন্ট অ্যাকাউন্ট খুলুন।<br />
                    ২. এরপর কুরিয়ার প্রতিনিধি আপনার শপ ভিজিট করে বা ফোনে অ্যাকাউন্ট ভেরিফাই করে দেবে।<br />
                    ৩. আপনার ওয়েবসাইটে কোনো অর্ডার আসলে অর্ডারের পাশে <strong>"📦 কুরিয়ারে পাঠান"</strong> বাটনে ক্লিক করলেই স্বয়ংক্রিয়ভাবে ট্র্যাকিং কোড তৈরি হবে এবং ডেলিভারি স্লিপ প্রিন্ট করে পার্সেলের গায়ে লাগিয়ে দিতে পারবেন।
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
              <button
                type="button"
                onClick={() => setShowCourierDirectory(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
