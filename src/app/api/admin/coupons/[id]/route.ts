import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const c = await cookies();
  return c.get("admin_session")?.value === "leisure-admin-ok";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const coupon = await prisma.coupon.update({
    where: { id: Number(id) },
    data: {
      ...(body.code !== undefined && { code: (body.code as string).toUpperCase().trim() }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.value !== undefined && { value: Number(body.value) }),
      ...(body.minOrder !== undefined && { minOrder: Number(body.minOrder) }),
      ...(body.maxDiscount !== undefined && { maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null }),
      ...(body.usageLimit !== undefined && { usageLimit: body.usageLimit ? Number(body.usageLimit) : null }),
      ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
      ...(body.active !== undefined && { active: body.active }),
    },
  });

  return NextResponse.json(coupon);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.coupon.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
