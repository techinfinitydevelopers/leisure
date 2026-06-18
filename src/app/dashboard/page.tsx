import Link from "next/link";
import { getAllProductsDB } from "@/lib/db-products";

export const dynamic = "force-dynamic";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default async function DashboardOverview() {
  const products = await getAllProductsDB();

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = products.filter((p) => p.stock < 5).length;
  const catalogValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const stats = [
    { label: "Total Products", value: String(totalProducts) },
    { label: "Total Units in Stock", value: totalStock.toLocaleString("en-IN") },
    { label: "Low Stock (< 5)", value: String(lowStock) },
    { label: "Total Catalog Value", value: inr.format(catalogValue) },
  ];

  const recent = [...products].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-offwhite sm:text-4xl">
          Overview
        </h1>
        <p className="mt-1 text-sm text-offwhite/60">
          Snapshot of your catalog and inventory.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-6">
            <p className="font-display text-3xl text-gold">{stat.value}</p>
            <p className="mt-2 text-sm text-offwhite/60">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl tracking-wide text-offwhite">
          Recent Products
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-offwhite/50">No products yet.</p>
        ) : (
          <ul className="glass divide-y divide-white/10 overflow-hidden rounded-2xl">
            {recent.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/dashboard/products/${p.id}/edit`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/5"
                >
                  <span className="font-display text-lg tracking-wide text-offwhite">
                    {p.model}
                  </span>
                  <span className="flex items-center gap-6 text-sm">
                    <span
                      className={
                        p.stock < 5 ? "text-red-400" : "text-offwhite/60"
                      }
                    >
                      {p.stock} in stock
                    </span>
                    <span className="text-gold">{inr.format(p.price)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
