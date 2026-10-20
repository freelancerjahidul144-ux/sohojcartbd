import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { subscribeOrders, updateOrderStatus } from '../services/firestoreService';
import { Order, OrderStatus } from '../types';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { products, categories, addToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const unsub = subscribeOrders((data) => {
      setOrders(data);
      setLoadingOrders(false);
    });
    return () => unsub();
  }, []);

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending').length;
  const completedOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const totalUnitsInStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalUnitsSold = products.reduce((acc, p) => acc + (p.salesCount || 0), 0);

  const uniqueCustomerEmails = new Set(orders.map((o) => o.customerEmail || o.customerPhone));
  const totalCustomers = Math.max(uniqueCustomerEmails.size, 1);

  const recentOrders = orders.slice(0, 6);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      addToast('success', `Order #${orderId} marked as ${newStatus}`);
    } catch {
      addToast('error', 'Failed to update order status.');
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-900">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Admin Overview</h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Real-time analytics and management for Sohoj Cart BD
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('products')}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* 8 Essential Metrics Cards (White Background, Black Text) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Products</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950">{totalProducts}</div>
          <span className="text-[10px] text-slate-500 font-medium">{categories.length} Active Categories</span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950">{totalOrders}</div>
          <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
            {pendingOrders} awaiting fulfillment
          </span>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Customers</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950">{totalCustomers}</div>
          <span className="text-[10px] text-teal-700 font-bold">Active shopper accounts</span>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950">৳{totalRevenue.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-700 font-bold">Total gross sales (BDT)</span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Orders</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingOrders}</div>
          <span className="text-[10px] text-slate-500 font-medium">Needs admin confirmation</span>
        </div>

        {/* Completed Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Completed Orders</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{completedOrders}</div>
          <span className="text-[10px] text-slate-500 font-medium">Successfully delivered</span>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Low Stock Products</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {lowStockCount}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Items with stock ≤ 5</span>
        </div>

        {/* Total Stock in Inventory & Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Inventory & Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {totalUnitsInStock} <span className="text-xs text-slate-500 font-bold">in stock</span>
          </div>
          <span className="text-[10px] text-amber-700 font-bold">🔥 মোট বিক্রি: {totalUnitsSold} টি</span>
        </div>
      </div>

      {/* Recent Orders Section (White Theme) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-950">Recent Customer Orders</h2>
            <p className="text-xs text-slate-500 font-medium">Latest orders placed on customer website</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-black text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-medium">
            No customer orders placed yet. Place an order on the storefront to test!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-800 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-950">{order.customerName}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{order.customerPhone}</td>
                    <td className="py-3 px-4 text-slate-700">{order.items?.length || 1} items</td>
                    <td className="py-3 px-4 font-black text-slate-950">
                      ৳{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : order.orderStatus === 'Pending'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="bg-white text-slate-900 border border-slate-300 text-[11px] font-bold rounded-lg px-2 py-1 outline-hidden cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
