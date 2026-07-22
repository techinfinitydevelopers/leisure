import { getStorefrontProducts } from "@/lib/products-source";

export async function GET() {
  const products = await getStorefrontProducts();
  return Response.json(
    products.map((p) => ({ id: p.id, slug: p.slug, model: p.model, price: p.price, mrp: p.mrp }))
  );
}
