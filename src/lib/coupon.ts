// Server-only coupon validation, shared by the public validate endpoint and the
// order-create route (so the discount can never be forged client-side).
import { prisma } from "@/lib/prisma";

export type CouponResult =
  | { ok: true; code: string; type: string; value: number; discount: number }
  | { ok: false; error: string };

/** Validate a code against a cart subtotal (INR) and compute the discount. */
export async function validateCoupon(
  codeRaw: string,
  subtotal: number,
): Promise<CouponResult> {
  const code = (codeRaw || "").toUpperCase().trim();
  if (!code) return { ok: false, error: "Enter a coupon code" };

  const c = await prisma.coupon.findUnique({ where: { code } });
  if (!c || !c.active) return { ok: false, error: "Invalid coupon code" };
  if (c.expiresAt && c.expiresAt.getTime() < Date.now())
    return { ok: false, error: "This coupon has expired" };
  if (c.usageLimit != null && c.usedCount >= c.usageLimit)
    return { ok: false, error: "This coupon has reached its usage limit" };
  if (subtotal < c.minOrder)
    return {
      ok: false,
      error: `Minimum order of ₹${c.minOrder.toLocaleString("en-IN")} required`,
    };

  let discount =
    c.type === "percent" ? Math.round((subtotal * c.value) / 100) : c.value;
  if (c.type === "percent" && c.maxDiscount != null)
    discount = Math.min(discount, c.maxDiscount);
  discount = Math.max(0, Math.min(discount, subtotal)); // never exceed subtotal

  return { ok: true, code: c.code, type: c.type, value: c.value, discount };
}
