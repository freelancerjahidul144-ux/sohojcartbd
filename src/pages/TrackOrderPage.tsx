import React, { useState } from 'react';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Order, OrderStatus } from '../types';

interface TrackOrderPageProps {
  onNavigate: (page: string) => void;
  initialOrderNumber?: string;
}

const ORDER_STEPS: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ onNavigate, initialOrderNumber = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialOrderNumber);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearched(true);
    setOrder(null);

    const term = searchTerm.trim();

    try {
      // 1. Try finding by ID directly
      const q1 = query(collection(db, 'orders'), where('orderNumber', '==', term));
      const snap1 = await getDocs(q1);

      if (!snap1.empty) {
        const found = snap1.docs[0].data() as Order;
        setOrder({ ...found, id: snap1.docs[0].id });
        setLoading(false);
        return;
      }

      // 2. Try finding by Phone
      const q2 = query(collection(db, 'orders'), where('customerPhone', '==', term));
      const snap2 = await getDocs(q2);

      if (!snap2.empty) {
        const found = snap2.docs[0].data() as Order;
        setOrder({ ...found, id: snap2.docs[0].id });
      }
    } catch (err) {
      console.warn('Track order lookup notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (step: OrderStatus) => {
    if (!order) return 'pending';
    if (order.orderStatus === 'Cancelled') return 'cancelled';

    const currentIdx = ORDER_STEPS.indexOf(order.orderStatus);
    const stepIdx = ORDER_STEPS.indexOf(step);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
          Live Fulfillment Tracking
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Track Your Delivery
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          Enter your Order Number (e.g. SCBD-2026-XXXX) or Phone Number to check real-time courier updates.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="Enter Order # or Mobile Phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:border-emerald-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Result Display */}
      {order && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-8 animate-in fade-in">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Order Tracking
              </span>
              <h2 className="text-xl font-extrabold text-gray-900">{order.orderNumber}</h2>
              <p className="text-xs text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  order.orderStatus === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.orderStatus === 'Cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Status: {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Timeline Step Progression */}
          {order.orderStatus === 'Cancelled' ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>This order was cancelled. Please contact our support team for any queries.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider">
                Delivery Progression
              </h3>
              <div className="grid grid-cols-5 gap-2 relative">
                {ORDER_STEPS.map((step, idx) => {
                  const state = getStepStatus(step);
                  const isCompleted = state === 'completed';
                  const isCurrent = state === 'current';

                  return (
                    <div key={step} className="flex flex-col items-center text-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[11px] mt-2 font-bold ${
                          isCurrent ? 'text-emerald-700' : isCompleted ? 'text-gray-800' : 'text-gray-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Details Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Recipient Details:
              </span>
              <p className="font-bold text-gray-900">{order.customerName}</p>
              <p className="text-gray-600">{order.customerPhone}</p>
              <p className="text-gray-600">{order.customerAddress}, {order.customerCity}</p>
              <p className="text-emerald-800 font-bold pt-1">
                আনুমানিক ডেলিভারি সময়:{' '}
                <strong className="text-emerald-950 underline">
                  {order.estimatedDeliveryTime || (order.customerCity?.toLowerCase().includes('dhaka') ? '২৪-৪৮ ঘণ্টার মধ্যে' : '৩-৫ কার্যদিবসের মধ্যে')}
                </strong>
              </p>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Payment & Total:
              </span>
              <p className="text-gray-600">Method: <strong>{order.paymentMethod}</strong></p>
              <p className="text-gray-600">Payment Status: <strong>{order.paymentStatus}</strong></p>
              <p className="text-sm font-extrabold text-emerald-700 pt-1">
                Total Payable: ৳{order.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {searched && !loading && !order && (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center max-w-xl mx-auto shadow-2xs">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-base mb-1">Order Not Found</h3>
          <p className="text-xs text-gray-500 mb-6">
            We couldn't locate any order matching "{searchTerm}". Please double-check your Order Number or Phone Number.
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-emerald-700"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
};
