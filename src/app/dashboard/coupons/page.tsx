"use client";

import { useEffect, useState } from "react";

type Coupon = {
  id: number;
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
};

const BLANK = {
  code: "",
  type: "percent" as const,
  value: "",
  minOrder: "",
  maxDiscount: "",
  usageLimit: "",
  expiresAt: "",
  active: true,
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((data) => { setCoupons(data); setLoading(false); });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrder: form.minOrder ? Number(form.minOrder) : 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt || null,
        active: form.active,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setError(data.error ?? "Failed to create coupon"); return; }

    setCoupons((prev) => [data, ...prev]);
    setForm(BLANK);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this coupon?")) return;
    setDeleting(id);
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  }

  async function toggleActive(coupon: Coupon) {
    setToggling(coupon.id);
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    if (res.ok) {
      setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, active: !c.active } : c));
    }
    setToggling(null);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-offwhite">Coupons</h1>
        <p className="mt-1 text-sm text-offwhite/50">Create discount codes for your customers</p>
      </div>

      {/* Create form */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 font-display text-lg font-semibold text-offwhite">New Coupon</h2>
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-offwhite/40 mb-1.5">Code *</label>
            <input
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="SAVE20"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-offwhite placeholder-offwhite/20 focus:border-gold/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-offwhite/40 mb-1.5">Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "flat" })}
              className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-offwhite focus:border-gold/50 focus:outline-none"
            >
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat (₹)</option>
            </select>
          </div>

          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-offwhite/40 mb-1.5">
              Value * {form.type === "percent" ? "(e.g. 10 = 10%)" : "(₹ off)"}
            </label>
            <input
              required
              type="number"
              min={1}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder={form.type === "percent" ? "10" : "500"}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-offwhite placeholder-offwhite/20 focus:border-gold/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-offwhite/40 mb-1.5">Min. Order (₹)</label>
            <input
              type="number"
              min={0}
              value={form.minOrder}
              onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
              placeholder="0"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-offwhite placeholder-offwhite/20 focus:border-gold/50 focus:outline-none"
            />
          </div>

          {form.type === "percent" && (
            <div>
              <label className="block text-[0.7rem] uppercase tracking-wider text-offwhite/40 mb-1.5">Max Discount (₹)</label>
              <input
                type="number"
                min={0}
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                placeholder="Unlimited"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-offwhite placeholder-offwhite/20 focus:border-gold/50 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-offwhite/40 mb-1.5">Usage Limit</label>
            <input
              type="number"
              min={1}
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              placeholder="Unlimited"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-offwhite placeholder-offwhite/20 focus:border-gold/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-offwhite/40 mb-1.5">Expires At</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-offwhite focus:border-gold/50 focus:outline-none [color-scheme:dark]"
            />
          </div>

          <div className="flex items-center gap-3 pt-5">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-offwhite/70">
              <div
                onClick={() => setForm({ ...form, active: !form.active })}
                className={`relative h-5 w-9 rounded-full transition-colors ${form.active ? "bg-gold" : "bg-white/20"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-black transition-transform ${form.active ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              Active
            </label>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-gold/90 disabled:opacity-50"
            >
              {saving ? "Creating…" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-offwhite/40">Loading…</div>
      ) : coupons.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
          <p className="text-3xl">🏷️</p>
          <p className="mt-2 text-offwhite/50">No coupons yet</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-[0.7rem] uppercase tracking-wider text-offwhite/40">Code</th>
                <th className="px-4 py-3 text-left text-[0.7rem] uppercase tracking-wider text-offwhite/40">Discount</th>
                <th className="px-4 py-3 text-left text-[0.7rem] uppercase tracking-wider text-offwhite/40">Usage</th>
                <th className="px-4 py-3 text-left text-[0.7rem] uppercase tracking-wider text-offwhite/40">Expires</th>
                <th className="px-4 py-3 text-left text-[0.7rem] uppercase tracking-wider text-offwhite/40">Status</th>
                <th className="px-4 py-3 text-left text-[0.7rem] uppercase tracking-wider text-offwhite/40"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-white/5 transition-colors hover:bg-white/5">
                  <td className="px-4 py-3.5 font-mono font-bold text-gold">{c.code}</td>
                  <td className="px-4 py-3.5 text-offwhite/80">
                    {c.type === "percent" ? `${c.value}% off` : `₹${c.value} off`}
                    {c.minOrder > 0 && <span className="ml-1.5 text-offwhite/40">· min ₹{c.minOrder.toLocaleString("en-IN")}</span>}
                    {c.maxDiscount && <span className="ml-1.5 text-offwhite/40">· max ₹{c.maxDiscount.toLocaleString("en-IN")}</span>}
                  </td>
                  <td className="px-4 py-3.5 text-offwhite/60">
                    {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : " / ∞"}
                  </td>
                  <td className="px-4 py-3.5 text-offwhite/60">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleActive(c)}
                      disabled={toggling === c.id}
                      className={`rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide transition-all disabled:opacity-50 ${
                        c.active
                          ? "border-green-500/30 bg-green-500/15 text-green-400"
                          : "border-white/10 bg-white/5 text-offwhite/40"
                      }`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      disabled={deleting === c.id}
                      className="rounded-lg px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
