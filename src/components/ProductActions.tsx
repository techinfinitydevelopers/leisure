"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import ProductGallery from "@/components/ProductGallery";
import type { ProductColor } from "@/lib/products";
import { getProductImages, PRODUCT_IMAGE_COUNTS } from "@/lib/products";

type Props = {
  productId: number;
  slug: string;
  model: string;
  price: number;
  mrp: number;
  colors: ProductColor[];
};

export default function ProductActions({ productId, slug, model, price, mrp, colors }: Props) {
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const { addItem, openCart } = useCart();
  const router = useRouter();

  const activeColor = colors[activeColorIdx];
  const folderSlug = activeColor.folderSlug;
  const count = PRODUCT_IMAGE_COUNTS[slug]?.[folderSlug] ?? 1;
  const firstImage = getProductImages(slug, folderSlug, 1)[0];

  function handleAdd() {
    addItem({
      productId,
      slug,
      model,
      price,
      mrp,
      color: activeColor.name,
      image: firstImage,
    });
  }

  function handleBuyNow() {
    addItem({
      productId,
      slug,
      model,
      price,
      mrp,
      color: activeColor.name,
      image: firstImage,
    });
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Gallery — passes color state up via callback */}
      <ProductGallery
        slug={slug}
        model={model}
        colors={colors}
        activeColorIdx={activeColorIdx}
        onColorChange={setActiveColorIdx}
      />

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
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
  );
}
