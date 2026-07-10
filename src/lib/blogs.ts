// Server-only: public blog reads for the storefront.
import { prisma } from "@/lib/prisma";

export type Blog = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function getPublishedBlogs(): Promise<Blog[]> {
  try {
    return await prisma.blog.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

/** Admin: fetch by id regardless of published state (for the edit page). */
export async function getBlogById(id: number): Promise<Blog | null> {
  try {
    return await prisma.blog.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const blog = await prisma.blog.findUnique({ where: { slug } });
    if (!blog || !blog.published) return null;
    return blog;
  } catch {
    return null;
  }
}
