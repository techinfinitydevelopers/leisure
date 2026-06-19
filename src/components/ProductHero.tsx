"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import ProductGallery from "@/components/ProductGallery";
import type { ProductColor } from "@/lib/products";
import { getProductImages, PRODUCT_IMAGE_COUNTS } from "@/lib/products";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

type Props = {
  productId: number;
  slug: string;
  model: string;
  tagline: string;
  price: number;
  mrp: number;
  savePercent: number;
  colors: ProductColor[];
};

export default function ProductHero({ productId, slug, model, tagline, price, mrp, savePercent, colors }: Props) {
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const { addItem } = useCart();
  const router = useRouter();

  const activeColor = colors[activeColorIdx];
  const folderSlug = activeColor.folderSlug;
  const firstImage = getProductImages(slug, folderSlug, 1)[0];

  function handleAdd() {
    addItem({ productId, slug, model, price, mrp, color: activeColor.name, image: firstImage });
  }

  function handleBuyNow() {
    addItem({ productId, slug, model, price, mrp, color: activeColor.name, image: firstImage });
    router.push("/checkout");
  }

  return (
    <section className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
      {/* Left — gallery */}
      <ProductGallery
        slug={slug}
        model={model}
        colors={colors}
        activeColorIdx={activeColorIdx}
        onColorChange={setActiveColorIdx}
      />

      {/* Right — info + price + color + buttons */}
      <div className="flex flex-col justify-center">
        <h1 className="font-display text-5xl font-bold tracking-tight text-offwhite sm:text-6xl">
          {model}
        </h1>
        <p className="font-pinyon mt-3 text-3xl text-gold sm:text-4xl">{tagline}</p>

        {/* Price */}
        <div className="mt-8 flex flex-wrap items-end gap-4">
          <span className="font-display text-4xl font-bold text-gold sm:text-5xl">{inr.format(price)}</span>
          <span className="font-sans text-lg text-offwhite/40 line-through">{inr.format(mrp)}</span>
          {savePercent > 0 && (
            <span className="rounded-full border border-gold/40 px-3 py-1 font-sans text-xs font-semibold uppercase tracking-wider text-gold">
              Save {savePercent}%
            </span>
          )}
        </div>

        {/* Color swatches */}
        <div className="mt-8">
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/40">Color</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {colors.map((color, i) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setActiveColorIdx(i)}
                aria-label={color.name}
                className="flex flex-col items-center gap-1.5 transition-all"
              >
                <span
                  className="block h-9 w-9 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: color.hex,
                    boxShadow: i === activeColorIdx
                      ? "0 0 0 2px #000, 0 0 0 4px #fbed2b"
                      : "0 0 0 1px rgba(255,255,255,0.2)",
                  }}
                />
                <span
                  className="text-[0.65rem] font-medium uppercase tracking-[0.1em] transition-colors"
                  style={{ color: i === activeColorIdx ? "#fbed2b" : "rgba(255,255,255,0.4)" }}
                >
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 rounded-full py-3.5 text-[0.78rem] font-black uppercase tracking-[0.16em] text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(251,237,43,0.4)]"
            style={{ background: "#fbed2b", minWidth: "140px" }}
          >
            Buy Now
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 rounded-full py-3.5 text-[0.78rem] font-black uppercase tracking-[0.16em] text-white transition-all hover:border-[#fbed2b] hover:text-[#fbed2b]"
            style={{ border: "1px solid rgba(255,255,255,0.2)", minWidth: "140px" }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  );
}
