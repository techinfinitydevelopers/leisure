"use client";

import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useProductExperience } from "@/lib/product-experience-context";
import { useCart } from "@/context/CartContext";
import { flyToCart } from "@/lib/flyToCart";

type Props = {
  productId: number;
  colorIndex: number;
};

export default function BuyBar({ productId, colorIndex }: Props) {
  const product = useProductExperience();
  const { addItem, openCart } = useCart();
  const router = useRouter();
  const fmt = (n: number) => product.currency + n.toLocaleString("en-IN");

  const color = product.colors[colorIndex] ?? product.colors[0];
  const cartItem = () => ({
    productId,
    slug: product.slug,
    model: product.name,
    price: product.price,
    mrp: product.mrp,
    color: color.name,
    image: color.images[0],
  });

  const handleAdd = (e: MouseEvent<HTMLButtonElement>) => {
    flyToCart(color.images[0], e.currentTarget.getBoundingClientRect(), () => {
      addItem(cartItem());
      openCart();
    });
  };
  const handleBuy = (e: MouseEvent<HTMLButtonElement>) => {
    flyToCart(color.images[0], e.currentTarget.getBoundingClientRect(), () => {
      addItem(cartItem());
      router.push("/checkout");
    });
  };

  return (
    <div className="buybar" id="buy">
      <div className="buybar__price">
        <span className="buybar__now">{fmt(product.price)}</span>
        <span className="buybar__mrp">{fmt(product.mrp)}</span>
        <span className="buybar__off">{product.discountPct}% OFF</span>
      </div>
      <div className="buybar__actions">
        <button type="button" className="btn btn--primary" onClick={handleBuy}>
          Buy Now
        </button>
        <button type="button" className="btn btn--ghost" onClick={handleAdd}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
