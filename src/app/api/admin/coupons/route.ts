import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const c = await cookies();
  return c.get("admin_session")?.value === "leisure-admin-ok";
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { code, type, value, minOrder, maxDiscount, usageLimit, expiresAt, active } = body;

  if (!code || !type || value == null) {
    return NextResponse.json({ error: "code, type, value are required" }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: (code as string).toUpperCase().trim(),
        type,
        value: Number(value),
        minOrder: minOrder ? Number(minOrder) : 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: active !== false,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }
}
