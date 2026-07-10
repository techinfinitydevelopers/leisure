import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCoupon } from "@/lib/coupon";

type OrderItemInput = { productId: number; color: string; qty: number; price: number };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address, city, pincode, items, couponCode } = body;

    if (!name || !email || !phone || !address || !city || !pincode || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Recompute the total server-side (never trust the client), then apply the
    // coupon discount if a valid code was supplied.
    const subtotal = (items as OrderItemInput[]).reduce(
      (sum, i) => sum + i.price * i.qty,
      0,
    );
    let total = subtotal;
    let appliedCode: string | null = null;
    if (couponCode) {
      const result = await validateCoupon(String(couponCode), subtotal);
      if (result.ok) {
        total = subtotal - result.discount;
        appliedCode = result.code;
      }
    }

    const order = await prisma.order.create({
      data: {
        name, email, phone,
        address: `${address}, ${city} - ${pincode}`,
        city, pincode,
        total,
        items: {
          create: (items as OrderItemInput[]).map((item) => ({
            productId: item.productId,
            color: item.color,
            qty: item.qty,
            price: item.price,
          })),
        },
      },
    });

    // Count the redemption so usageLimit is enforced going forward.
    if (appliedCode) {
      await prisma.coupon.update({
        where: { code: appliedCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
