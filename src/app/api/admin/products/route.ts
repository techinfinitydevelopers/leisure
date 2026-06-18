import { revalidatePath } from "next/cache";
import {
  createProductDB,
  getAllProductsDB,
  type ProductInput,
} from "@/lib/db-products";

export async function GET() {
  const products = await getAllProductsDB();
  return Response.json(products);
}

function normalizeInput(body: unknown): ProductInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  const slug = String(b.slug ?? "").trim();
  const model = String(b.model ?? "").trim();
  if (!slug || !model) return null;

  return {
    slug,
    model,
    tagline: String(b.tagline ?? ""),
    description: String(b.description ?? ""),
    price: Number(b.price ?? 0),
    mrp: Number(b.mrp ?? 0),
    stock: Number(b.stock ?? 0),
    imageUrl: String(b.imageUrl ?? ""),
    colors: Array.isArray(b.colors) ? (b.colors as ProductInput["colors"]) : [],
    specs: Array.isArray(b.specs) ? (b.specs as ProductInput["specs"]) : [],
    inBox: Array.isArray(b.inBox) ? (b.inBox as string[]) : [],
    technical: Array.isArray(b.technical)
      ? (b.technical as ProductInput["technical"])
      : [],
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = normalizeInput(body);
  if (!input) {
    return Response.json(
      { error: "model and slug are required" },
      { status: 400 },
    );
  }

  try {
    const product = await createProductDB(input);
    revalidatePath("/shop");
    revalidatePath(`/product/${product.slug}`);
    return Response.json(product, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("Unique")
        ? "A product with that slug already exists"
        : "Failed to create product";
    return Response.json({ error: message }, { status: 400 });
  }
}
