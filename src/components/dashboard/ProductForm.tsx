"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type {
  DbProduct,
  ProductColor,
  SpecPair,
} from "@/lib/db-products";

type Mode = "create" | "edit";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-offwhite outline-none focus:border-gold";
const labelClass =
  "mb-1 block text-xs uppercase tracking-wide text-offwhite/60";

export default function ProductForm({
  mode,
  initial,
}: {
  mode: Mode;
  initial?: DbProduct;
}) {
  const router = useRouter();

  const [model, setModel] = useState(initial?.model ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [mrp, setMrp] = useState(initial ? String(initial.mrp) : "");
  const [stock, setStock] = useState(initial ? String(initial.stock) : "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [colors, setColors] = useState<ProductColor[]>(
    initial?.colors ?? [],
  );
  const [specs, setSpecs] = useState<SpecPair[]>(initial?.specs ?? []);
  const [inBox, setInBox] = useState<string[]>(initial?.inBox ?? []);
  const [technical, setTechnical] = useState<SpecPair[]>(
    initial?.technical ?? [],
  );

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleModelChange(value: string) {
    setModel(value);
    if (mode === "create" && !slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.ok && data.url) {
        setImageUrl(data.url);
      } else {
        setError(data.error ?? "Upload failed");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!model.trim() || !slug.trim()) {
      setError("Model and slug are required.");
      return;
    }

    const payload = {
      model: model.trim(),
      slug: slug.trim(),
      tagline,
      description,
      price: Number(price) || 0,
      mrp: Number(mrp) || 0,
      stock: Number(stock) || 0,
      imageUrl,
      colors,
      specs,
      inBox,
      technical,
    };

    setSubmitting(true);
    try {
      const res =
        mode === "create"
          ? await fetch("/api/admin/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/products/${initial?.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      if (res.ok) {
        router.push("/dashboard/products");
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(data.error ?? "Failed to save product.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {error && (
        <p
          className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Scalar fields */}
      <section className="glass rounded-2xl p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label htmlFor="model" className={labelClass}>
              Model <span className="text-gold">*</span>
            </label>
            <input
              id="model"
              value={model}
              onChange={(e) => handleModelChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug <span className="text-gold">*</span>
            </label>
            <input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className={inputClass}
            />
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="tagline" className={labelClass}>
              Tagline
            </label>
            <input
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="price" className={labelClass}>
              Price (INR)
            </label>
            <input
              id="price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="mrp" className={labelClass}>
              MRP (INR)
            </label>
            <input
              id="mrp"
              type="number"
              min={0}
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="stock" className={labelClass}>
              Stock
            </label>
            <input
              id="stock"
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Image upload */}
      <section className="glass rounded-2xl p-6">
        <h2 className="mb-4 font-display text-lg tracking-wide text-offwhite">
          Product Image
        </h2>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Preview"
                width={112}
                height={112}
                className="h-28 w-28 object-contain"
              />
            ) : (
              <span className="text-xs text-offwhite/40">No image</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="btn-outline cursor-pointer px-4 py-2 text-xs">
              {uploading ? "Uploading…" : "Choose Image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="text-xs uppercase tracking-wide text-offwhite/50 hover:text-red-300"
              >
                Clear image
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Colors */}
      <section className="glass rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg tracking-wide text-offwhite">
            Colors
          </h2>
          <button
            type="button"
            onClick={() =>
              setColors((prev) => [...prev, { name: "", hex: "#edc484" }])
            }
            className="btn-outline px-3 py-1.5 text-xs"
          >
            Add Color
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {colors.length === 0 && (
            <p className="text-xs text-offwhite/40">No colors added.</p>
          )}
          {colors.map((color, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                aria-label="Color name"
                placeholder="Name"
                value={color.name}
                onChange={(e) =>
                  setColors((prev) =>
                    prev.map((c, i) =>
                      i === idx ? { ...c, name: e.target.value } : c,
                    ),
                  )
                }
                className={`${inputClass} flex-1`}
              />
              <input
                aria-label="Color hex"
                type="color"
                value={color.hex}
                onChange={(e) =>
                  setColors((prev) =>
                    prev.map((c, i) =>
                      i === idx ? { ...c, hex: e.target.value } : c,
                    ),
                  )
                }
                className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-white/5"
              />
              <button
                type="button"
                onClick={() =>
                  setColors((prev) => prev.filter((_, i) => i !== idx))
                }
                className="shrink-0 rounded-full border border-red-400/40 px-3 py-1.5 text-xs uppercase tracking-wide text-red-300 hover:border-red-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Specs */}
      <PairSection
        title="Specs"
        pairs={specs}
        onAdd={() => setSpecs((prev) => [...prev, { label: "", value: "" }])}
        onChange={setSpecs}
      />

      {/* In the Box */}
      <section className="glass rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg tracking-wide text-offwhite">
            In the Box
          </h2>
          <button
            type="button"
            onClick={() => setInBox((prev) => [...prev, ""])}
            className="btn-outline px-3 py-1.5 text-xs"
          >
            Add Item
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {inBox.length === 0 && (
            <p className="text-xs text-offwhite/40">No items added.</p>
          )}
          {inBox.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                aria-label="Box item"
                placeholder="Item"
                value={item}
                onChange={(e) =>
                  setInBox((prev) =>
                    prev.map((v, i) => (i === idx ? e.target.value : v)),
                  )
                }
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={() =>
                  setInBox((prev) => prev.filter((_, i) => i !== idx))
                }
                className="shrink-0 rounded-full border border-red-400/40 px-3 py-1.5 text-xs uppercase tracking-wide text-red-300 hover:border-red-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Technical */}
      <PairSection
        title="Technical"
        pairs={technical}
        onAdd={() =>
          setTechnical((prev) => [...prev, { label: "", value: "" }])
        }
        onChange={setTechnical}
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="btn-gold disabled:opacity-60"
        >
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Create Product"
              : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/products")}
          className="btn-outline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function PairSection({
  title,
  pairs,
  onAdd,
  onChange,
}: {
  title: string;
  pairs: SpecPair[];
  onAdd: () => void;
  onChange: (next: SpecPair[]) => void;
}) {
  return (
    <section className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg tracking-wide text-offwhite">
          {title}
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="btn-outline px-3 py-1.5 text-xs"
        >
          Add Row
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {pairs.length === 0 && (
          <p className="text-xs text-offwhite/40">No rows added.</p>
        )}
        {pairs.map((pair, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <input
              aria-label="Label"
              placeholder="Label"
              value={pair.label}
              onChange={(e) =>
                onChange(
                  pairs.map((p, i) =>
                    i === idx ? { ...p, label: e.target.value } : p,
                  ),
                )
              }
              className={`${inputClass} flex-1`}
            />
            <input
              aria-label="Value"
              placeholder="Value"
              value={pair.value}
              onChange={(e) =>
                onChange(
                  pairs.map((p, i) =>
                    i === idx ? { ...p, value: e.target.value } : p,
                  ),
                )
              }
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => onChange(pairs.filter((_, i) => i !== idx))}
              className="shrink-0 rounded-full border border-red-400/40 px-3 py-1.5 text-xs uppercase tracking-wide text-red-300 hover:border-red-400"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
