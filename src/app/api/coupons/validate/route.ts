import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupon";

// Public endpoint: check a coupon code against a cart subtotal and return the
// computed discount (or an error message) for the checkout page to display.
export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    const result = await validateCoupon(String(code ?? ""), Number(subtotal) || 0);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Could not validate coupon" }, { status: 500 });
  }
}
