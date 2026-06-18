import ProductForm from "@/components/dashboard/ProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-offwhite sm:text-4xl">
          Add Product
        </h1>
        <p className="mt-1 text-sm text-offwhite/60">
          Create a new product for the catalog.
        </p>
      </header>

      <ProductForm mode="create" />
    </div>
  );
}
