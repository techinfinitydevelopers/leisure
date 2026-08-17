import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-session";
import { getCurrentCustomer } from "@/lib/customer-account";
import { listMyTickets } from "@/lib/support-app";

export const metadata: Metadata = {
  title: "My Warranty Tickets — Leisure",
};

const STATUS_LABEL: Record<string, string> = {
  registered: "Registered",
  verifying: "Verifying invoice",
  pickup: "Pickup arranged",
  testing: "Bench testing",
  resolved: "Resolved",
};

export default async function MyTicketsPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login");

  const customer = await getCurrentCustomer(session.access_token);
  const tickets = await listMyTickets(customer.id);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-36 sm:px-6 sm:pt-44">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
        My Account
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold text-offwhite">
        Warranty Tickets
      </h1>

      <div className="mt-10 flex gap-6 border-b border-white/10">
        <Link
          href="/account"
          className="pb-3 text-sm font-semibold text-offwhite/50 transition-colors hover:text-gold"
        >
          Orders
        </Link>
        <span className="border-b-2 border-gold pb-3 text-sm font-semibold text-offwhite">
          Warranty Tickets
        </span>
      </div>

      <div className="mt-8">
        {tickets.length === 0 ? (
          <div className="glass rounded-3xl px-8 py-14 text-center">
            <p className="text-offwhite/65">
              You haven&apos;t raised any warranty claims yet.
            </p>
            <Link href="/support" className="btn-gold mt-6 inline-block">
              Register a Claim
            </Link>
          </div>
        ) : (
          <div className="glass divide-y divide-white/10 rounded-3xl">
            {tickets.map((t) => {
              const last = t.messages[t.messages.length - 1];
              return (
                <Link
                  key={t.id}
                  href={`/account/tickets/${t.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-white/[0.03]"
                >
                  <div>
                    <p className="font-semibold text-offwhite">
                      {t.productModel} · {t.colour}
                    </p>
                    <p className="mt-1 text-sm text-offwhite/50">
                      Invoice {t.invoiceNumber} · Raised{" "}
                      {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                    {last && (
                      <p className="mt-2 max-w-md truncate text-sm text-offwhite/40">
                        {last.authorType === "staff" ? "Support: " : "You: "}
                        {last.body}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
                    {STATUS_LABEL[t.status] ?? t.status}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
