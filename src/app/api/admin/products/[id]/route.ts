import { revalidatePath } from "next/cache";
import {
  deleteProductDB,
  getProductByIdDB,
  updateProductDB,
  type ProductInput,
} from "@/lib/db-products";

function buildPatch(body: Record<string, unknown>): Partial<ProductInput> {
  const patch: Partial<ProductInput> = {};
  if (typeof body.slug === "string") patch.slug = body.slug.trim();
  if (typeof body.model === "string") patch.model = body.model.trim();
  if (typeof body.tagline === "string") patch.tagline = body.tagline;
  if (typeof body.description === "string") patch.description = body.description;
  if (body.price !== undefined) patch.price = Number(body.price);
  if (body.mrp !== undefined) patch.mrp = Number(body.mrp);
  if (body.stock !== undefined) patch.stock = Number(body.stock);
  if (typeof body.imageUrl === "string") patch.imageUrl = body.imageUrl;
  if (Array.isArray(body.colors))
    patch.colors = body.colors as ProductInput["colors"];
  if (Array.isArray(body.specs))
    patch.specs = body.specs as ProductInput["specs"];
  if (Array.isArray(body.inBox)) patch.inBox = body.inBox as string[];
  if (Array.isArray(body.technical))
    patch.technical = body.technical as ProductInput["technical"];
  return patch;
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/products/[id]">,
) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const product = await updateProductDB(
      numId,
      buildPatch(body as Record<string, unknown>),
    );
    revalidatePath("/shop");
    revalidatePath(`/product/${product.slug}`);
    return Response.json(product);
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("Unique")
        ? "A product with that slug already exists"
        : "Failed to update product";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/admin/products/[id]">,
) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await getProductByIdDB(numId);
  if (!existing) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  await deleteProductDB(numId);
  revalidatePath("/shop");
  revalidatePath(`/product/${existing.slug}`);
  return Response.json({ ok: true });
}
