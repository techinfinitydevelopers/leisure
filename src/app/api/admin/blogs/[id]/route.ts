import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const c = await cookies();
  return c.get("admin_session")?.value === "leisure-admin-ok";
}

function slugify(v: string): string {
  return v
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  if (body.title !== undefined) patch.title = String(body.title).trim();
  if (body.slug !== undefined) patch.slug = slugify(body.slug);
  if (body.excerpt !== undefined) patch.excerpt = body.excerpt;
  if (body.content !== undefined) patch.content = body.content;
  if (body.coverImage !== undefined) patch.coverImage = body.coverImage;
  if (body.author !== undefined) patch.author = String(body.author).trim() || "Leisure";
  if (body.published !== undefined) patch.published = Boolean(body.published);

  try {
    const blog = await prisma.blog.update({
      where: { id: Number(id) },
      data: patch,
    });
    return NextResponse.json(blog);
  } catch {
    return NextResponse.json({ error: "Update failed (slug may be taken)" }, { status: 409 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.blog.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
