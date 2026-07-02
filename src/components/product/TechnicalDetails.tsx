"use client";

import { useProductExperience } from "@/lib/product-experience-context";
import SpecRow from "./SpecRow";

export default function TechnicalDetails() {
  const product = useProductExperience();
  return (
    <section className="specs specs--tech" id="technical">
      <div className="specs__inner">
        <header className="specs__head">
          <span className="eyebrow">Under the hood</span>
          <h2 className="specs__title">Technical Details</h2>
        </header>
        <div className="specs__list">
          {product.technical.map((s, i) => (
            <SpecRow key={s.k} k={s.k} v={s.v} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
