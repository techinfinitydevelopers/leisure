"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  id: number;
  qty: number;
  price: number;
  color: string;
  product: { model: string; slug: string };
};

type Order = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  shipped: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  delivered: "bg-green-500/15 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); });
  }, []);

  async function updateStatus(id: number, status: string) {
    setUpdating(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }
    setUpdating(null);
  }

  const total = orders.reduce((s, o) => s + o.total, 0);
  const byStatus = STATUS_OPTIONS.reduce((acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s).length }), {} as Record<string, number>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-offwhite">Orders</h1>
        <p className="mt-1 text-sm text-offwhite/50">{orders.length} total orders · {inr.format(total)} revenue</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STATUS_OPTIONS.map((s) => (
          <div key={s} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-offwhite">{byStatus[s] ?? 0}</p>
            <p className="mt-1 text-[0.7rem] uppercase tracking-wider text-offwhite/40 capitalize">{s}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-offwhite/40">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 py-20 text-center">
          <p className="text-2xl">📦</p>
          <p className="mt-2 text-offwhite/50">No orders yet</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-[0.7rem] uppercase tracking-wider text-offwhite/40">Order</th>
                <th className="px-4 py-3 text-left text-[0.7rem] uppercase tracking-wider text-offwhite/40">Customer</th>
                <th className="px-4 py-3 text-left text-[0.7rem] uppercase tracking-wider text-offwhite/40">Date</th>
                <th className="px-4 py-3 text-left text-[0.7rem] uppercase tracking-wider text-offwhite/40">Total</th>
                <th className="px-4 py-3 text-left text-[0.7rem] uppercase tracking-wider text-offwhite/40">Status</th>
                <th className="px-4 py-3 text-left text-[0.7rem] uppercase tracking-wider text-offwhite/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <>
                  <tr
                    key={order.id}
                    className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5"
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  >
                    <td className="px-4 py-3.5 font-mono text-gold">#{order.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-offwhite">{order.name}</p>
                      <p className="text-offwhite/40">{order.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-offwhite/60">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-offwhite">{inr.format(order.total)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide ${STATUS_COLORS[order.status] ?? ""}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-offwhite focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-[#111]">{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expanded === order.id && (
                    <tr key={`${order.id}-detail`} className="border-b border-white/5 bg-white/[0.02]">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-[0.7rem] uppercase tracking-wider text-offwhite/30 mb-2">Delivery Address</p>
                            <p className="text-offwhite/80">{order.name}</p>
                            <p className="text-offwhite/60">{order.address}</p>
                            <p className="text-offwhite/60">{order.city} — {order.pincode}</p>
                            <p className="text-offwhite/60">{order.phone}</p>
                          </div>
                          <div>
                            <p className="text-[0.7rem] uppercase tracking-wider text-offwhite/30 mb-2">Items ({order.items.length})</p>
                            <div className="space-y-1.5">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <span className="text-offwhite/80">
                                    {item.product.model}
                                    {item.color && <span className="ml-1.5 text-offwhite/40">· {item.color}</span>}
                                    <span className="ml-1.5 text-offwhite/40">× {item.qty}</span>
                                  </span>
                                  <span className="text-gold">{inr.format(item.price * item.qty)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
