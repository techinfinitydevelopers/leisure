"use client";

import { useEffect, useState } from "react";

type ShippingZone = {
  id: number;
  name: string;
  states: string;
  rate: number;
  freeAbove: number | null;
  active: boolean;
  createdAt: string;
};

const BLANK = { name: "", states: "", rate: "", freeAbove: "", active: true };

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "J&K", "Ladakh", "Puducherry",
];

export default function ShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<typeof BLANK & { id: number }>>({});

  useEffect(() => {
    fetch("/api/admin/shipping")
      .then((r) => r.json())
      .then((data) => { setZones(data); setLoading(false); });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const statesArr = form.states
      ? form.states.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const res = await fetch("/api/admin/shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        states: statesArr,
        rate: Number(form.rate),
        freeAbove: form.freeAbove ? Number(form.freeAbove) : null,
        active: form.active,
      }),
    });

    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Failed"); return; }
    setZones((prev) => [...prev, data]);
    setForm(BLANK);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this shipping zone?")) return;
    await fetch(`/api/admin/shipping/${id}`, { method: "DELETE" });
    setZones((prev) => prev.filter((z) => z.id !== id));
  }

  async function handleEditSave(id: number) {
    const res = await fetch(`/api/admin/shipping/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(editForm.name !== undefined && { name: editForm.name }),
        ...(editForm.rate !== undefined && { rate: Number(editForm.rate) }),
        ...(editForm.freeAbove !== undefined && { freeAbove: editForm.freeAbove ? Number(editForm.freeAbove) : null }),
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setZones((prev) => prev.map((z) => z.id === id ? updated : z));
    }
    setEditId(null);
  }

  async function toggleActive(zone: ShippingZone) {
    const res = await fetch(`/api/admin/shipping/${zone.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !zone.active }),
    });
    if (res.ok) {
      setZones((prev) => prev.map((z) => z.id === zone.id ? { ...z, active: !z.active } : z));
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-offwhite">Shipping</h1>
        <p className="mt-1 text-sm text-offwhite/50">Configure delivery zones and rates</p>
      </div>

      {/* Create form */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 font-display text-lg font-semibold text-offwhite">New Shipping Zone</h2>
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-offwhite/40 mb-1.5">Zone Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. North India, All India, Metro Cities"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-offwhite placeholder-offwhite/20 focus:border-gold/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-offwhite/40 mb-1.5">Shipping Rate (₹) *</label>
            <input
              required
              type="number"
              min={0}
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: e.target.value })}
              placeholder="99"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-offwhite placeholder-offwhite/20 focus:border-gold/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-offwhite/40 mb-1.5">Free Shipping Above (₹)</label>
            <input
              type="number"
              min={0}
              value={form.freeAbove}
              onChange={(e) => setForm({ ...form, freeAbove: e.target.value })}
              placeholder="e.g. 999 (0 = never free)"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-offwhite placeholder-offwhite/20 focus:border-gold/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] uppercase tracking-wider text-offwhite/40 mb-1.5">States (comma-separated, leave blank = all)</label>
            <input
              value={form.states}
              onChange={(e) => setForm({ ...form, states: e.target.value })}
              placeholder="Maharashtra, Gujarat, Delhi"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-offwhite placeholder-offwhite/20 focus:border-gold/50 focus:outline-none"
              list="states-list"
            />
            <datalist id="states-list">
              {INDIA_STATES.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div className="flex items-end gap-4 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-offwhite/70">
              <div
                onClick={() => setForm({ ...form, active: !form.active })}
                className={`relative h-5 w-9 rounded-full transition-colors ${form.active ? "bg-gold" : "bg-white/20"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-black transition-transform ${form.active ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              Active
            </label>

            {error && <p className="flex-1 text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="ml-auto rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-gold/90 disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add Zone"}
            </button>
          </div>
        </form>
      </div>

      {/* Zones list */}
      {loading ? (
        <div className="py-12 text-center text-offwhite/40">Loading…</div>
      ) : zones.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
          <p className="text-3xl">🚚</p>
          <p className="mt-2 text-offwhite/50">No shipping zones configured</p>
        </div>
      ) : (
        <div className="space-y-3">
          {zones.map((zone) => {
            const states: string[] = JSON.parse(zone.states || "[]");
            const isEditing = editId === zone.id;
            return (
              <div key={zone.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                {isEditing ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      value={editForm.name ?? zone.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-offwhite focus:border-gold/50 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={editForm.rate ?? zone.rate}
                      onChange={(e) => setEditForm({ ...editForm, rate: e.target.value })}
                      placeholder="Rate (₹)"
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-offwhite focus:border-gold/50 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={editForm.freeAbove ?? (zone.freeAbove ?? "")}
                      onChange={(e) => setEditForm({ ...editForm, freeAbove: e.target.value })}
                      placeholder="Free above (₹)"
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-offwhite focus:border-gold/50 focus:outline-none"
                    />
                    <div className="flex gap-2 sm:col-span-3">
                      <button type="button" onClick={() => handleEditSave(zone.id)} className="rounded-xl bg-gold px-4 py-1.5 text-xs font-bold text-black">Save</button>
                      <button type="button" onClick={() => setEditId(null)} className="rounded-xl border border-white/10 px-4 py-1.5 text-xs text-offwhite/60">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-offwhite">{zone.name}</p>
                        <button
                          type="button"
                          onClick={() => toggleActive(zone)}
                          className={`rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${zone.active ? "border-green-500/30 bg-green-500/15 text-green-400" : "border-white/10 bg-white/5 text-offwhite/40"}`}
                        >
                          {zone.active ? "Active" : "Inactive"}
                        </button>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-offwhite/50">
                        <span>₹{zone.rate} shipping</span>
                        {zone.freeAbove && <span>Free above ₹{zone.freeAbove.toLocaleString("en-IN")}</span>}
                        <span>{states.length > 0 ? states.join(", ") : "All India"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setEditId(zone.id); setEditForm({}); }} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-offwhite/60 hover:border-gold/30 hover:text-gold">Edit</button>
                      <button type="button" onClick={() => handleDelete(zone.id)} className="rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
