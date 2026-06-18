// Server-only module: only imported from Server Components and route handlers.
import { prisma } from "@/lib/prisma";

export type ProductColor = { name: string; hex: string };
export type SpecPair = { label: string; value: string };

/** Product shape with parsed JSON columns, used across dashboard + public pages. */
export type DbProduct = {
  id: number;
  slug: string;
  model: string;
  tagline: string;
  description: string;
  price: number; // INR rupees
  mrp: number; // INR rupees
  stock: number;
  imageUrl: string;
  colors: ProductColor[];
  specs: SpecPair[];
  inBox: string[];
  technical: SpecPair[];
  createdAt: Date;
  updatedAt: Date;
};

/** Editable fields accepted by create/update. */
export type ProductInput = {
  slug: string;
  model: string;
  tagline: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  imageUrl: string;
  colors: ProductColor[];
  specs: SpecPair[];
  inBox: string[];
  technical: SpecPair[];
};

type ProductRow = {
  id: number;
  slug: string;
  model: string;
  tagline: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  imageUrl: string;
  colors: string;
  specs: string;
  inBox: string;
  technical: string;
  createdAt: Date;
  updatedAt: Date;
};

function safeParse<T>(value: string, fallback: T): T {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function rowToProduct(row: ProductRow): DbProduct {
  return {
    id: row.id,
    slug: row.slug,
    model: row.model,
    tagline: row.tagline,
    description: row.description,
    price: row.price,
    mrp: row.mrp,
    stock: row.stock,
    imageUrl: row.imageUrl,
    colors: safeParse<ProductColor[]>(row.colors, []),
    specs: safeParse<SpecPair[]>(row.specs, []),
    inBox: safeParse<string[]>(row.inBox, []),
    technical: safeParse<SpecPair[]>(row.technical, []),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Serialize the structured array fields into the JSON string columns. */
function inputToRow(data: ProductInput) {
  return {
    slug: data.slug,
    model: data.model,
    tagline: data.tagline,
    description: data.description,
    price: Math.round(data.price),
    mrp: Math.round(data.mrp),
    stock: Math.round(data.stock),
    imageUrl: data.imageUrl,
    colors: JSON.stringify(data.colors ?? []),
    specs: JSON.stringify(data.specs ?? []),
    inBox: JSON.stringify(data.inBox ?? []),
    technical: JSON.stringify(data.technical ?? []),
  };
}

export async function getAllProductsDB(): Promise<DbProduct[]> {
  const rows = await prisma.product.findMany({ orderBy: { id: "asc" } });
  return rows.map(rowToProduct);
}

export async function getProductBySlugDB(
  slug: string,
): Promise<DbProduct | null> {
  const row = await prisma.product.findUnique({ where: { slug } });
  return row ? rowToProduct(row) : null;
}

export async function getProductByIdDB(id: number): Promise<DbProduct | null> {
  const row = await prisma.product.findUnique({ where: { id } });
  return row ? rowToProduct(row) : null;
}

export async function createProductDB(data: ProductInput): Promise<DbProduct> {
  const row = await prisma.product.create({ data: inputToRow(data) });
  return rowToProduct(row);
}

export async function updateProductDB(
  id: number,
  data: Partial<ProductInput>,
): Promise<DbProduct> {
  const patch: Record<string, unknown> = {};
  if (data.slug !== undefined) patch.slug = data.slug;
  if (data.model !== undefined) patch.model = data.model;
  if (data.tagline !== undefined) patch.tagline = data.tagline;
  if (data.description !== undefined) patch.description = data.description;
  if (data.price !== undefined) patch.price = Math.round(data.price);
  if (data.mrp !== undefined) patch.mrp = Math.round(data.mrp);
  if (data.stock !== undefined) patch.stock = Math.round(data.stock);
  if (data.imageUrl !== undefined) patch.imageUrl = data.imageUrl;
  if (data.colors !== undefined) patch.colors = JSON.stringify(data.colors);
  if (data.specs !== undefined) patch.specs = JSON.stringify(data.specs);
  if (data.inBox !== undefined) patch.inBox = JSON.stringify(data.inBox);
  if (data.technical !== undefined)
    patch.technical = JSON.stringify(data.technical);

  const row = await prisma.product.update({ where: { id }, data: patch });
  return rowToProduct(row);
}

export async function setStockDB(
  id: number,
  stock: number,
): Promise<DbProduct> {
  const row = await prisma.product.update({
    where: { id },
    data: { stock: Math.round(stock) },
  });
  return rowToProduct(row);
}

export async function deleteProductDB(id: number): Promise<DbProduct> {
  const row = await prisma.product.delete({ where: { id } });
  return rowToProduct(row);
}
