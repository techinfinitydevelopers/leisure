import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const c = await cookies();
  return c.get("admin_session")?.value === "leisure-admin-ok";
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const zones = await prisma.shippingZone.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(zones);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, states, rate, freeAbove, active } = body;

  if (!name || rate == null) {
    return NextResponse.json({ error: "name and rate are required" }, { status: 400 });
  }

  const zone = await prisma.shippingZone.create({
    data: {
      name,
      states: JSON.stringify(states ?? []),
      rate: Number(rate),
      freeAbove: freeAbove ? Number(freeAbove) : null,
      active: active !== false,
    },
  });

  return NextResponse.json(zone, { status: 201 });
}
