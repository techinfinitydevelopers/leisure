"use client";

import { useProductExperience } from "@/lib/product-experience-context";

type ColorSwatchesProps = {
  value?: number;
  onChange?: (i: number) => void;
};

export default function ColorSwatches({ value = 0, onChange }: ColorSwatchesProps) {
  const product = useProductExperience();
  return (
    <div className="swatches">
      <span className="swatches__label">{product.colors[value].name}</span>
      <div className="swatches__row">
        {product.colors.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-label={c.name}
            aria-pressed={value === i}
            className={`swatch-dot ${value === i ? "is-active" : ""}`}
            style={{ "--c": c.hex } as React.CSSProperties}
            onClick={() => onChange?.(i)}
          />
        ))}
      </div>
    </div>
  );
}
