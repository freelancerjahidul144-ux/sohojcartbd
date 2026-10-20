import React from 'react';
import {
  CheckCircle2,
  Printer,
  ShoppingBag,
  Truck,
  ArrowRight,
  MapPin,
  Phone,
  Calendar,
  Clock,
} from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessPageProps {
  order: Order;
  onNavigate: (page: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ order, onNavigate }) => {
  const handlePrint = () => {
    window.print();
  };

  const deliveryEst = new Date(Date.now() + (order.customerCity.toLowerCase().includes('dhaka') ? 86400000 * 2 : 86400000 * 4));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Confirmation Header */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden shadow-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Thank You! আপনার অর্ডারটি গ্রহণ করা হয়েছে
        </h1>
        <p className="text-xs sm:text-sm text-emerald-200 max-w-md mx-auto">
          We have received your order. Our team will verify and dispatch it via express courier.
        </p>

        {/* Estimated Delivery Highlight */}
        <div className="mt-4 inline-flex items-center gap-2 bg-emerald-800/90 text-amber-300 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-emerald-600/60 shadow-md">
          <Truck className="w-4 h-4 text-amber-400" />
          <span>পণ্য পৌঁছানোর সম্ভাব্য সময়:</span>
          <span className="text-white font-extrabold underline">
            {order.estimatedDeliveryTime || (order.customerCity?.toLowerCase().includes('dhaka') ? '২৪ থেকে ৪৮ ঘণ্টার মধ্যে (১-২ কার্যদিবস)' : '৩ থেকে ৫ কার্যদিবসের মধ্যে')}
          </span>
        </div>

        <div className="mt-4 block">
          <div className="inline-flex items-center gap-2 bg-emerald-900/80 px-4 py-2 rounded-xl text-xs font-mono font-bold text-emerald-200 border border-emerald-700/50">
            <span>Order Number:</span>
            <span className="text-white text-sm">{order.orderNumber}</span>
          </div>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6 print:m-0 print:border-none">
        {/* Top Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <span className="text-xs font-extrabold text-emerald-600">INVOICE & RECEIPT</span>
            <h2 className="text-lg font-bold text-gray-900">Sohoj Cart BD</h2>
            <p className="text-xs text-gray-500">Banani, Dhaka-1213, Bangladesh • +880 1712-345678</p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

        {/* Customer & Delivery Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Delivering To:
            </span>
            <p className="font-extrabold text-sm text-gray-900">{order.customerName}</p>
            <p className="text-gray-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span>{order.customerPhone}</span>
            </p>
            <p className="text-gray-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{order.customerAddress}, {order.customerCity}</span>
            </p>
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Order Details:
            </span>
            <p className="text-gray-600">
              Payment Method: <strong className="text-gray-900">{order.paymentMethod}</strong>
            </p>
            <p className="text-gray-600">
              Payment Status: <strong className="text-emerald-700">{order.paymentStatus}</strong>
            </p>
            <p className="text-gray-600">
              আনুমানিক পৌঁছানোর সময়:{' '}
              <strong className="text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {order.estimatedDeliveryTime || (order.customerCity.toLowerCase().includes('dhaka') ? '২৪ থেকে ৪৮ ঘণ্টার মধ্যে (১-২ কার্যদিবস)' : '৩ থেকে ৫ কার্যদিবসের মধ্যে')}
              </strong>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 font-medium text-gray-900">{item.productName}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-gray-600">৳{item.price.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations */}
        <div className="space-y-1.5 text-xs text-gray-600 max-w-xs ml-auto pt-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-bold text-gray-900">৳{order.subtotal.toLocaleString()}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount:</span>
              <span>-৳{order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span className="font-bold text-gray-900">
              {order.deliveryCharge === 0 ? 'FREE' : `৳${order.deliveryCharge}`}
            </span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total Amount:</span>
            <span className="text-base text-emerald-700">৳{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
        <button
          onClick={() => onNavigate('track-order')}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4 text-emerald-400" />
          <span>Track Order Status</span>
        </button>

        <button
          onClick={() => onNavigate('products')}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
