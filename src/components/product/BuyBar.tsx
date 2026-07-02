"use client";

import { useProductExperience } from "@/lib/product-experience-context";

export default function BuyBar() {
  const product = useProductExperience();
  const fmt = (n: number) => product.currency + n.toLocaleString("en-IN");

  return (
    <div className="buybar" id="buy">
      <div className="buybar__price">
        <span className="buybar__now">{fmt(product.price)}</span>
        <span className="buybar__mrp">{fmt(product.mrp)}</span>
        <span className="buybar__off">{product.discountPct}% OFF</span>
      </div>
      <div className="buybar__actions">
        <button type="button" className="btn btn--primary">
          Buy Now
        </button>
        <button type="button" className="btn btn--ghost">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
