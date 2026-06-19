import { getAllProductsDB } from "@/lib/db-products";

export async function GET() {
  const products = await getAllProductsDB();
  return Response.json(
    products.map((p) => ({ id: p.id, slug: p.slug, model: p.model, price: p.price, mrp: p.mrp }))
  );
}
