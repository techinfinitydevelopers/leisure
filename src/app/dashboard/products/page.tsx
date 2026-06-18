import Link from "next/link";
import { getAllProductsDB } from "@/lib/db-products";
import ProductsTable from "@/components/dashboard/ProductsTable";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getAllProductsDB();

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-offwhite sm:text-4xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-offwhite/60">
            {products.length} product{products.length === 1 ? "" : "s"} in the
            catalog.
          </p>
        </div>
        <Link href="/dashboard/products/new" className="btn-gold">
          Add Product
        </Link>
      </header>

      <ProductsTable products={products} />
    </div>
  );
}
