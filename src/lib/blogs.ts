// Server-only: public blog reads for the storefront.
//
// Blogs are merged from two sources — Shopify (source of truth in headless
// setup) plus the local Prisma DB (legacy / drafts). Shopify articles win when
// the same slug exists in both places. Local dashboard writes still work but
// only appear on the storefront when the same slug isn't already in Shopify.
import { prisma } from "@/lib/prisma";
import { getShopifyArticles, getShopifyArticleByHandle } from "@/lib/shopify-blogs";

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
  const [shopify, local] = await Promise.all([
    getShopifyArticles(),
    prisma.blog
      .findMany({ where: { published: true }, orderBy: { createdAt: "desc" } })
      .catch<Blog[]>(() => []),
  ]);
  const seen = new Set(shopify.map((b) => b.slug));
  const merged = [...shopify];
  for (const b of local) if (!seen.has(b.slug)) merged.push(b);
  return merged;
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
  const shopify = await getShopifyArticleByHandle(slug);
  if (shopify) return shopify;
  try {
    const blog = await prisma.blog.findUnique({ where: { slug } });
    if (!blog || !blog.published) return null;
    return blog;
  } catch {
    return null;
  }
}
