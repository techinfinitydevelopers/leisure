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

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const blogs = await prisma.blog.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(blogs);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, slug, excerpt, content, coverImage, author, published } = body;

  if (!title || !String(title).trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const finalSlug = slugify(slug || title);
  if (!finalSlug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    const blog = await prisma.blog.create({
      data: {
        title: String(title).trim(),
        slug: finalSlug,
        excerpt: excerpt ?? "",
        content: content ?? "",
        coverImage: coverImage ?? "",
        author: author?.trim() || "Leisure",
        published: published !== false,
      },
    });
    return NextResponse.json(blog, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A blog with this slug already exists" }, { status: 409 });
  }
}
