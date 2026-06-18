import { notFound } from "next/navigation";
import { getProductByIdDB } from "@/lib/db-products";
import ProductForm from "@/components/dashboard/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductByIdDB(Number(id));

  if (!product) {
    notFound();
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-offwhite sm:text-4xl">
          Edit Product
        </h1>
        <p className="mt-1 text-sm text-offwhite/60">{product.model}</p>
      </header>

      <ProductForm mode="edit" initial={product} />
    </div>
  );
}
