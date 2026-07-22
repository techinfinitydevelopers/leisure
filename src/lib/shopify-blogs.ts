// Shopify Storefront API bindings for blog articles. Fetches all articles
// across every blog in the store and maps them into the local `Blog` shape so
// the existing /blog list + detail pages render them without changes.
import type { Blog } from "@/lib/blogs";

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";

function isShopifyConfigured(): boolean {
  return Boolean(DOMAIN && TOKEN);
}

type GqlResult<T> = { data?: T; errors?: unknown };

async function storefront<T>(query: string): Promise<T | null> {
  if (!isShopifyConfigured()) return null;
  try {
    const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN!,
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as GqlResult<T>;
    if (json.errors) return null;
    return json.data ?? null;
  } catch {
    return null;
  }
}

type ShopifyArticle = {
  id: string;
  handle: string;
  title: string;
  excerpt: string | null;
  contentHtml: string;
  image: { url: string; altText: string | null } | null;
  authorV2: { name: string } | null;
  publishedAt: string;
};

const ARTICLE_FIELDS = `
  id
  handle
  title
  excerpt
  contentHtml
  image { url altText }
  authorV2 { name }
  publishedAt
`;

function articleToBlog(a: ShopifyArticle): Blog {
  return {
    id: parseInt(a.id.replace(/\D/g, "")) || 0,
    slug: a.handle,
    title: a.title,
    excerpt: a.excerpt ?? "",
    content: a.contentHtml ?? "",
    coverImage: a.image?.url ?? "",
    author: a.authorV2?.name ?? "Leisure",
    published: true,
    createdAt: new Date(a.publishedAt),
    updatedAt: new Date(a.publishedAt),
  };
}

/** All articles from every blog in the store, mapped to the local Blog shape. */
export async function getShopifyArticles(): Promise<Blog[]> {
  const data = await storefront<{
    blogs: { edges: { node: { articles: { edges: { node: ShopifyArticle }[] } } }[] };
  }>(`{
    blogs(first: 10) {
      edges {
        node {
          articles(first: 50) {
            edges { node { ${ARTICLE_FIELDS} } }
          }
        }
      }
    }
  }`);
  if (!data) return [];
  const all: Blog[] = [];
  for (const b of data.blogs.edges) {
    for (const a of b.node.articles.edges) all.push(articleToBlog(a.node));
  }
  // Newest first
  all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return all;
}

/** A single article by handle (slug). Searches all blogs. */
export async function getShopifyArticleByHandle(handle: string): Promise<Blog | null> {
  const escaped = handle.replace(/"/g, '\\"');
  const data = await storefront<{
    blogs: { edges: { node: { articleByHandle: ShopifyArticle | null } }[] };
  }>(`{
    blogs(first: 10) {
      edges {
        node {
          articleByHandle(handle: "${escaped}") { ${ARTICLE_FIELDS} }
        }
      }
    }
  }`);
  if (!data) return null;
  for (const b of data.blogs.edges) {
    if (b.node.articleByHandle) return articleToBlog(b.node.articleByHandle);
  }
  return null;
}
