import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const c = await cookies();
  return c.get("admin_session")?.value === "leisure-admin-ok";
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await prisma.paymentSetting.findMany({ orderBy: { id: "asc" } });
  // Mask secret keys in response
  return NextResponse.json(
    settings.map((s) => ({
      ...s,
      keySecret: s.keySecret ? "••••••••" : "",
      webhookSecret: s.webhookSecret ? "••••••••" : "",
    }))
  );
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { provider, label, keyId, keySecret, webhookSecret, active } = body;

  if (!provider) return NextResponse.json({ error: "provider required" }, { status: 400 });

  const setting = await prisma.paymentSetting.upsert({
    where: { provider },
    create: { provider, label: label ?? provider, keyId: keyId ?? "", keySecret: keySecret ?? "", webhookSecret: webhookSecret ?? "", active: active !== false },
    update: {
      ...(label !== undefined && { label }),
      ...(keyId !== undefined && { keyId }),
      ...(keySecret !== undefined && keySecret !== "••••••••" && { keySecret }),
      ...(webhookSecret !== undefined && webhookSecret !== "••••••••" && { webhookSecret }),
      ...(active !== undefined && { active }),
    },
  });

  return NextResponse.json({ ...setting, keySecret: setting.keySecret ? "••••••••" : "", webhookSecret: setting.webhookSecret ? "••••••••" : "" });
}
