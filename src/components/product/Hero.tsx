"use client";

import { useProductExperience } from "@/lib/product-experience-context";
import ColorSwatches from "./ColorSwatches";
import Thumbnails from "./Thumbnails";
import BuyBar from "./BuyBar";

type HeroProps = {
  colorIndex: number;
  viewIndex: number;
  onColor?: (i: number) => void;
  onView?: (i: number) => void;
  productId: number;
};

export default function Hero({ colorIndex, viewIndex, onColor, onView, productId }: HeroProps) {
  const product = useProductExperience();
  const variant: string = product.perspective?.heroVariant ?? "split";

  if (variant === "center") {
    return (
      <section className="hero hero--center">
        <div className="hero--center__inner">
          <header className="hero--center__head">
            <span className="eyebrow">{product.tagline}</span>
            <h1 className="hero__title hero--center__title">{product.name}</h1>
          </header>

          {/* empty framed stage — the WebGL plane parks here center-stage at rest */}
          <div className="hero--center__stage">
            <div className="hero__frame" aria-hidden="true" />
          </div>

          <div className="hero--center__info">
            <ColorSwatches value={colorIndex} onChange={onColor} />
            <Thumbnails
              images={product.colors[colorIndex].images}
              value={viewIndex}
              onChange={onView}
            />
            <BuyBar productId={productId} colorIndex={colorIndex} />
          </div>
        </div>
        <div className="hero__scroll">SCROLL TO EXPLORE</div>
      </section>
    );
  }

  // 'split' (default / DRIFT)
  return (
    <section className="hero">
      <div className="hero__grid">
        {/* empty framed grid slot — the WebGL plane parks here at rest (now LEFT) */}
        <div className="hero__slot">
          <div className="hero__frame" aria-hidden="true" />
          <Thumbnails
            images={product.colors[colorIndex].images}
            value={viewIndex}
            onChange={onView}
          />
        </div>

        <div className="hero__info">
          <span className="eyebrow">{product.tagline}</span>
          <h1 className="hero__title">{product.name}</h1>
          <p className="hero__sub">{product.blurb}</p>
          <ColorSwatches value={colorIndex} onChange={onColor} />
          <BuyBar productId={productId} colorIndex={colorIndex} />
        </div>
      </div>
      <div className="hero__scroll">SCROLL TO EXPLORE</div>
    </section>
  );
}
