"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { DbProduct } from "@/lib/db-products";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function imageSrc(product: DbProduct): string {
  return product.imageUrl || `/products/${product.slug}.png`;
}

export default function ProductsTable({
  products: initial,
}: {
  products: DbProduct[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState<DbProduct[]>(initial);
  const [stockDrafts, setStockDrafts] = useState<Record<number, number>>(() =>
    Object.fromEntries(initial.map((p) => [p.id, p.stock])),
  );
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function setDraft(id: number, value: number) {
    setStockDrafts((prev) => ({ ...prev, [id]: value }));
  }

  async function saveStock(id: number) {
    const stock = stockDrafts[id];
    if (stock === undefined || Number.isNaN(stock)) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: Number(stock) }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, stock: Number(stock) } : p)),
        );
      }
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: number, model: string) {
    if (!window.confirm(`Delete "${model}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (products.length === 0) {
    return (
      <p className="glass rounded-2xl p-8 text-center text-sm text-offwhite/50">
        No products yet. Add your first one.
      </p>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="glass hidden overflow-hidden rounded-2xl lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-offwhite/50">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">MRP</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {products.map((p) => (
              <tr key={p.id} className="align-middle">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
                      <Image
                        src={imageSrc(p)}
                        alt={p.model}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-offwhite">{p.model}</p>
                      <p className="text-xs text-offwhite/50">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gold">{inr.format(p.price)}</td>
                <td className="px-4 py-3 text-offwhite/40 line-through">
                  {inr.format(p.mrp)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={stockDrafts[p.id] ?? p.stock}
                      onChange={(e) => setDraft(p.id, Number(e.target.value))}
                      className="w-20 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-offwhite outline-none focus:border-gold"
                    />
                    <button
                      type="button"
                      onClick={() => saveStock(p.id)}
                      disabled={savingId === p.id}
                      className="btn-outline px-3 py-1.5 text-xs disabled:opacity-60"
                    >
                      {savingId === p.id ? "Saving…" : "Save"}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/products/${p.id}/edit`}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.model)}
                      disabled={deletingId === p.id}
                      className="rounded-full border border-red-400/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-red-300 transition-colors hover:border-red-400 hover:text-red-200 disabled:opacity-60"
                    >
                      {deletingId === p.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet cards */}
      <div className="flex flex-col gap-4 lg:hidden">
        {products.map((p) => (
          <div key={p.id} className="glass rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
                <Image
                  src={imageSrc(p)}
                  alt={p.model}
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg tracking-wide text-offwhite">
                  {p.model}
                </p>
                <p className="text-xs text-offwhite/50">{p.slug}</p>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <span className="text-gold">{inr.format(p.price)}</span>
                  <span className="text-offwhite/40 line-through">
                    {inr.format(p.mrp)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <label className="text-xs uppercase tracking-wide text-offwhite/60">
                Stock
              </label>
              <input
                type="number"
                min={0}
                value={stockDrafts[p.id] ?? p.stock}
                onChange={(e) => setDraft(p.id, Number(e.target.value))}
                className="w-20 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-offwhite outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={() => saveStock(p.id)}
                disabled={savingId === p.id}
                className="btn-outline px-3 py-1.5 text-xs disabled:opacity-60"
              >
                {savingId === p.id ? "Saving…" : "Save"}
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Link
                href={`/dashboard/products/${p.id}/edit`}
                className="btn-outline flex-1 px-3 py-1.5 text-xs"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(p.id, p.model)}
                disabled={deletingId === p.id}
                className="flex-1 rounded-full border border-red-400/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-red-300 transition-colors hover:border-red-400 hover:text-red-200 disabled:opacity-60"
              >
                {deletingId === p.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
