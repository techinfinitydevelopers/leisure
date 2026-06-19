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

  const zone = await prisma.shippingZone.update({
    where: { id: Number(id) },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.states !== undefined && { states: JSON.stringify(body.states) }),
      ...(body.rate !== undefined && { rate: Number(body.rate) }),
      ...(body.freeAbove !== undefined && { freeAbove: body.freeAbove ? Number(body.freeAbove) : null }),
      ...(body.active !== undefined && { active: body.active }),
    },
  });

  return NextResponse.json(zone);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.shippingZone.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
