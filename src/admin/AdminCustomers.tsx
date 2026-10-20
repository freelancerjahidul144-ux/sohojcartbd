import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Eye,
  MessageCircle,
  PhoneCall,
  Calendar,
  X,
} from 'lucide-react';
import { subscribeOrders } from '../services/firestoreService';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

export type CustomerStatusType = 'VIP' | 'Regular' | 'New' | 'Blocked';

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: CustomerStatusType;
  orders: Order[];
}

const STORAGE_KEY = 'admin_customer_status_overrides';

export const AdminCustomers: React.FC = () => {
  const { addToast } = useStore();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerStatusType>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  // Status overrides from storage
  const [statusOverrides, setStatusOverrides] = useState<Record<string, CustomerStatusType>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const unsub = subscribeOrders((orders: Order[]) => {
      const map = new Map<string, CustomerSummary>();

      orders.forEach((o) => {
        const key = (o.customerPhone || o.customerEmail || 'unknown').trim();
        if (!key || key === 'unknown') return;

        const existing = map.get(key);
        if (existing) {
          existing.totalOrders += 1;
          existing.totalSpent += o.totalAmount || 0;
          existing.orders.push(o);
          if (new Date(o.createdAt).getTime() > new Date(existing.lastOrderDate).getTime()) {
            existing.lastOrderDate = o.createdAt;
            existing.address = o.customerAddress || existing.address;
            existing.city = o.customerCity || existing.city;
            existing.name = o.customerName || existing.name;
          }
        } else {
          map.set(key, {
            id: key,
            name: o.customerName || 'Customer',
            email: o.customerEmail || 'N/A',
            phone: o.customerPhone || 'N/A',
            city: o.customerCity || 'Dhaka',
            address: o.customerAddress || '',
            totalOrders: 1,
            totalSpent: o.totalAmount || 0,
            lastOrderDate: o.createdAt,
            status: 'New',
            orders: [o],
          });
        }
      });

      const list = Array.from(map.values()).map((c) => {
        // Sort customer orders newest first
        c.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Check if manual override exists
        if (statusOverrides[c.id]) {
          c.status = statusOverrides[c.id];
        } else {
          // Automatic rule
          if (c.totalSpent >= 50000 || c.totalOrders >= 5) {
            c.status = 'VIP';
          } else if (c.totalOrders > 1) {
            c.status = 'Regular';
          } else {
            c.status = 'New';
          }
        }
        return c;
      });

      // If database is empty, provide demo customer for testing
      if (list.length === 0) {
        list.push({
          id: 'demo-cust-1',
          name: 'Tanvir Hasan',
          email: 'tanvir@gmail.com',
          phone: '01711223344',
          city: 'Dhaka',
          address: 'House 12, Road 4, Dhanmondi',
          totalOrders: 3,
          totalSpent: 16500,
          lastOrderDate: new Date().toISOString(),
          status: statusOverrides['demo-cust-1'] || 'VIP',
          orders: [],
        });
      }

      setCustomers(list);
    });

    return () => unsub();
  }, [statusOverrides]);

  // Handle changing customer status
  const handleStatusChange = (customerId: string, newStatus: CustomerStatusType) => {
    const updated = { ...statusOverrides, [customerId]: newStatus };
    setStatusOverrides(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }

    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, status: newStatus } : c))
    );

    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    const statusLabels: Record<CustomerStatusType, string> = {
      VIP: 'VIP Shopper (ভিআইপি ক্রেতা)',
      Regular: 'Regular Shopper (নিয়মিত ক্রেতা)',
      New: 'New Shopper (নতুন ক্রেতা)',
      Blocked: 'Blocked (ব্লকড / সতর্ক থাকুন)',
    };

    addToast('success', `কাস্টমার স্ট্যাটাস পরিবর্তন করে "${statusLabels[newStatus]}" করা হয়েছে।`);
  };

  // Quick WhatsApp helper
  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullNumber = cleanPhone.startsWith('0') ? `88${cleanPhone}` : cleanPhone;
    return `https://wa.me/${fullNumber}`;
  };

  // Filtering
  const filtered = customers.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) {
      return false;
    }
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  // Counts
  const vipCount = customers.filter((c) => c.status === 'VIP').length;
  const regularCount = customers.filter((c) => c.status === 'Regular').length;
  const newCount = customers.filter((c) => c.status === 'New').length;
  const blockedCount = customers.filter((c) => c.status === 'Blocked').length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            <span>Customer Management (ক্রেতা তালিকা)</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-semibold">
            ক্রেতাদের কেনাকাটার হিসাব, অতীত অর্ডার হিস্ট্রি এবং স্ট্যাটাস ম্যানেজমেন্ট
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-800 font-black bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>মোট কাস্টমার:</span>
            <strong className="text-emerald-700 text-sm font-black">{customers.length}</strong>
          </div>
          <div className="text-xs text-slate-800 font-black bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5">
            <span>মোট বিক্রি:</span>
            <strong className="text-amber-600 text-sm font-black">৳{totalRevenue.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Info Callout explaining Status */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
        <div className="space-y-1">
          <p className="font-extrabold flex items-center gap-1.5">
            <span>💡 কাস্টমার স্ট্যাটাস কীভাবে কাজ করে?</span>
          </p>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            সিস্টেম স্বয়ংক্রিয়ভাবে অর্ডারের ওপর ভিত্তি করে স্ট্যাটাস দেয় (১টি অর্ডার = <strong>New</strong>, ২+ অর্ডার = <strong>Regular</strong>, বড় অঙ্কের ক্রেতা = <strong>VIP</strong>)। তবে আপনি চাইলে সরাসরি টেবিল থেকে যেকোনো কাস্টমারের স্ট্যাটাস নিজের মতো পরিবর্তন (VIP, Regular, New, Blocked) করতে পারবেন।
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              সব কাস্টমার ({customers.length})
            </button>
            <button
              onClick={() => setStatusFilter('Regular')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === 'Regular'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              🟢 Regular Shopper ({regularCount})
            </button>
            <button
              onClick={() => setStatusFilter('New')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === 'New'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              🔵 New Shopper ({newCount})
            </button>
            <button
              onClick={() => setStatusFilter('VIP')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === 'VIP'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              👑 VIP Shopper ({vipCount})
            </button>
            {blockedCount > 0 && (
              <button
                onClick={() => setStatusFilter('Blocked')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  statusFilter === 'Blocked'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                ⛔ Blocked ({blockedCount})
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="নাম, ফোন বা শহর দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 text-slate-900 font-bold rounded-xl focus:border-amber-500 focus:bg-white outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-900 font-black border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Customer (ক্রেতা)</th>
                <th className="py-3.5 px-4">Phone / যোগাযোগ</th>
                <th className="py-3.5 px-4">Location (ঠিকানা)</th>
                <th className="py-3.5 px-4 text-center">Total Orders</th>
                <th className="py-3.5 px-4 text-right">Total Spent</th>
                <th className="py-3.5 px-4 text-center">Last Activity</th>
                <th className="py-3.5 px-4 text-center">Status (ক্লিক করে পরিবর্তন করুন)</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    কোনো কাস্টমার খুঁজে পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    {/* Customer Name & Email */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="text-left group cursor-pointer"
                        title="কাস্টমারের বিস্তারিত ও অর্ডার দেখতে ক্লিক করুন"
                      >
                        <p className="font-black text-slate-950 text-sm group-hover:text-amber-600 transition flex items-center gap-1.5">
                          <span>{c.name}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">{c.email}</p>
                      </button>
                    </td>

                    {/* Phone & Direct Contact Buttons */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-mono font-bold text-xs">{c.phone}</span>
                        {c.phone && c.phone !== 'N/A' && (
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${c.phone}`}
                              className="p-1 rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition border border-emerald-200"
                              title="সরাসরি কল করুন"
                            >
                              <PhoneCall className="w-3 h-3" />
                            </a>
                            <a
                              href={getWhatsAppLink(c.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200 transition border border-emerald-300"
                              title="WhatsApp মেসেজ পাঠান"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">{c.city || 'ঢাকা'}</td>

                    {/* Total Orders */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black bg-slate-100 text-slate-900 border border-slate-200">
                        {c.totalOrders} order(s)
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                      ৳{c.totalSpent.toLocaleString()}
                    </td>

                    {/* Last Order Date */}
                    <td className="py-3.5 px-4 text-center text-slate-600 font-medium text-[11px]">
                      {new Date(c.lastOrderDate).toLocaleDateString()}
                    </td>

                    {/* Interactive Status Selector */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-block">
                        <select
                          value={c.status}
                          onChange={(e) =>
                            handleStatusChange(c.id, e.target.value as CustomerStatusType)
                          }
                          className={`text-[11px] font-black px-2.5 py-1 rounded-xl border cursor-pointer outline-hidden transition ${
                            c.status === 'VIP'
                              ? 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
                              : c.status === 'Regular'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                              : c.status === 'Blocked'
                              ? 'bg-rose-100 text-rose-950 border-rose-300 hover:bg-rose-200'
                              : 'bg-blue-100 text-blue-950 border-blue-300 hover:bg-blue-200'
                          }`}
                          title="স্ট্যাটাস পরিবর্তন করতে সিলেক্ট করুন"
                        >
                          <option value="Regular">🟢 Regular Shopper</option>
                          <option value="New">🔵 New Shopper</option>
                          <option value="VIP">👑 VIP Shopper</option>
                          <option value="Blocked">⛔ Blocked / সতর্ক</option>
                        </select>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-950 border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
                        title="অর্ডার হিস্ট্রি ও বিস্তারিত দেখুন"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-700" />
                        <span>অর্ডার হিস্ট্রি</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail & Orders History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                    <span>{selectedCustomer.name}</span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        selectedCustomer.status === 'VIP'
                          ? 'bg-amber-100 text-amber-950 border-amber-300'
                          : selectedCustomer.status === 'Regular'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : selectedCustomer.status === 'Blocked'
                          ? 'bg-rose-100 text-rose-950 border-rose-300'
                          : 'bg-blue-100 text-blue-950 border-blue-300'
                      }`}
                    >
                      {selectedCustomer.status} Shopper
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-950 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">মোট অর্ডার</p>
                  <p className="text-lg font-black text-slate-950 mt-0.5">
                    {selectedCustomer.totalOrders} টি
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">মোট কেনাকাটা</p>
                  <p className="text-lg font-black text-emerald-800 mt-0.5">
                    ৳{selectedCustomer.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <p className="text-[10px] font-bold text-amber-800 uppercase">শহর / অবস্থান</p>
                  <p className="text-xs font-black text-amber-950 mt-1 truncate">
                    {selectedCustomer.city || 'ঢাকা'}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                  <p className="text-[10px] font-bold text-blue-700 uppercase">সর্বশেষ অর্ডার</p>
                  <p className="text-xs font-black text-blue-950 mt-1 truncate">
                    {new Date(selectedCustomer.lastOrderDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Contact & Status Controls */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span>ফোন নম্বর: {selectedCustomer.phone}</span>
                  </p>
                  {selectedCustomer.address && (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{selectedCustomer.address}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedCustomer.phone && selectedCustomer.phone !== 'N/A' && (
                    <>
                      <a
                        href={`tel:${selectedCustomer.phone}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition border border-emerald-300 flex items-center gap-1.5"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>কল করুন</span>
                      </a>
                      <a
                        href={getWhatsAppLink(selectedCustomer.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-950 bg-emerald-300 hover:bg-emerald-400 transition flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Change Status Inside Modal */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900">কাস্টমার স্ট্যাটাস পরিবর্তন করুন:</p>
                  <p className="text-[10px] text-slate-500">আপনার পছন্দমতো ট্যাগ সেট করতে পারেন</p>
                </div>
                <select
                  value={selectedCustomer.status}
                  onChange={(e) =>
                    handleStatusChange(
                      selectedCustomer.id,
                      e.target.value as CustomerStatusType
                    )
                  }
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 cursor-pointer"
                >
                  <option value="Regular">🟢 Regular Shopper (নিয়মিত)</option>
                  <option value="New">🔵 New Shopper (নতুন)</option>
                  <option value="VIP">👑 VIP Shopper (ভিআইপি)</option>
                  <option value="Blocked">⛔ Blocked (ব্লকড / সতর্ক)</option>
                </select>
              </div>

              {/* Order History List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-amber-500" />
                  <span>অর্ডার হিস্ট্রি ({selectedCustomer.orders.length} টি)</span>
                </h4>

                {selectedCustomer.orders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-xl border border-slate-200">
                    কোনো অর্ডার পাওয়া যায়নি।
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedCustomer.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-950">
                              #{ord.orderNumber || ord.id.slice(0, 8)}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                ord.orderStatus === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.orderStatus === 'Cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : ord.orderStatus === 'Shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {ord.orderStatus}
                            </span>
                          </div>
                          <span className="font-black text-emerald-700 text-sm">
                            ৳{(ord.totalAmount || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(ord.createdAt).toLocaleString()}
                          </span>
                          <span className="font-semibold text-slate-700">
                            পেমেন্ট: {ord.paymentMethod} ({ord.paymentStatus})
                          </span>
                        </div>

                        {/* Order Items list */}
                        {ord.items && ord.items.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 space-y-1">
                            {ord.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-[11px] text-slate-600"
                              >
                                <span className="truncate max-w-[280px]">
                                  • {item.productName || 'Product'} × {item.quantity}
                                </span>
                                <span className="font-mono text-slate-900 font-bold">
                                  ৳{(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
