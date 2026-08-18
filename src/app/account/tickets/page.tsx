import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LifeBuoy, ChevronRight } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-session";
import { getCurrentCustomer, deriveDisplayName } from "@/lib/customer-account";
import { listMyTickets } from "@/lib/support-app";
import AccountShell from "@/components/account/AccountShell";
import StatusBadge from "@/components/account/StatusBadge";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "My Warranty Tickets — Leisure",
};

export default async function MyTicketsPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login");

  const customer = await getCurrentCustomer(session.access_token);
  const tickets = await listMyTickets(customer.id);
  const name = deriveDisplayName(customer.firstName, customer.lastName, customer.email);

  return (
    <AccountShell name={name} email={customer.email} active="tickets">
      <Reveal>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-display text-3xl font-bold text-offwhite sm:text-4xl">
            Warranty Tickets
          </h1>
          {tickets.length > 0 && (
            <Link
              href="/support"
              className="hidden text-sm font-semibold text-gold hover:underline sm:inline"
            >
              + New claim
            </Link>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-6">
          {tickets.length === 0 ? (
            <div className="glass flex flex-col items-center rounded-3xl px-8 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-offwhite/40">
                <LifeBuoy size={24} />
              </div>
              <p className="mt-5 max-w-xs text-offwhite/65">
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
                    className="group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <p className="font-display font-semibold text-offwhite">
                          {t.productModel} · {t.colour}
                        </p>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="mt-1.5 text-sm text-offwhite/50">
                        Invoice {t.invoiceNumber} · Raised{" "}
                        {new Date(t.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      {last && (
                        <p className="mt-2 max-w-md truncate text-sm text-offwhite/40">
                          {last.authorType === "staff" ? "Support: " : "You: "}
                          {last.body}
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-offwhite/25 transition-transform group-hover:translate-x-0.5 group-hover:text-gold"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Reveal>
    </AccountShell>
  );
}
