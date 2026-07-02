"use client";

import { createContext, useContext } from "react";
import type { ProductExperience } from "./product-experience";

const ProductExperienceContext = createContext<ProductExperience | null>(null);

export function ProductExperienceProvider({
  value,
  children,
}: {
  value: ProductExperience;
  children: React.ReactNode;
}) {
  return (
    <ProductExperienceContext.Provider value={value}>
      {children}
    </ProductExperienceContext.Provider>
  );
}

export function useProductExperience(): ProductExperience {
  const ctx = useContext(ProductExperienceContext);
  if (!ctx) {
    throw new Error(
      "useProductExperience must be used within a ProductExperienceProvider",
    );
  }
  return ctx;
}
