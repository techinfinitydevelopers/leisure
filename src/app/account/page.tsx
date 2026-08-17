import type { Metadata } from "next";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-session";
import { customerAccountQuery, deriveDisplayName } from "@/lib/customer-account";
import AccountShell from "@/components/account/AccountShell";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "My Account — Leisure",
};

type CustomerProfile = {
  customer: {
    firstName: string | null;
    lastName: string | null;
    emailAddress: { emailAddress: string } | null;
    orders: {
      nodes: {
        id: string;
        name: string;
        processedAt: string;
        financialStatus: string | null;
        totalPrice: { amount: string; currencyCode: string };
      }[];
    };
  };
};

const PROFILE_QUERY = `#graphql
  query AccountHome {
    customer {
      firstName
      lastName
      emailAddress { emailAddress }
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          totalPrice { amount currencyCode }
        }
      }
    }
  }
`;

export default async function AccountPage() {
  const session = await getCustomerSession();

  if (!session) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 pb-24 pt-32 text-center sm:px-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
          My Account
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-offwhite">
          Sign in
        </h1>
        <p className="mt-4 text-offwhite/65">
          Log in to see your orders and warranty tickets.
        </p>
        <a href="/account/login" className="btn-gold mt-8 inline-block">
          Log in
        </a>
      </main>
    );
  }

  const data = await customerAccountQuery<CustomerProfile>(
    session.access_token,
    PROFILE_QUERY
  );
  const customer = data.customer;
  const email = customer.emailAddress?.emailAddress ?? null;
  const name = deriveDisplayName(customer.firstName, customer.lastName, email);
  const orders = customer.orders.nodes;

  return (
    <AccountShell name={name} email={email} active="orders">
      <Reveal>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="font-display text-3xl font-bold text-offwhite sm:text-4xl">
            Orders
          </h1>
          {orders.length > 0 && (
            <span className="text-sm text-offwhite/50">
              {orders.length} order{orders.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-6">
          {orders.length === 0 ? (
            <div className="glass flex flex-col items-center rounded-3xl px-8 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-offwhite/40">
                <Package size={24} />
              </div>
              <p className="mt-5 text-offwhite/65">No orders yet.</p>
              <Link href="/shop" className="btn-gold mt-6 inline-flex items-center gap-2">
                Start shopping
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="glass divide-y divide-white/10 rounded-3xl">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-5"
                >
                  <div>
                    <p className="font-display font-semibold text-offwhite">{o.name}</p>
                    <p className="mt-1 text-sm text-offwhite/50">
                      {new Date(o.processedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {o.financialStatus && (
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-offwhite/50">
                        {o.financialStatus.replace(/_/g, " ").toLowerCase()}
                      </span>
                    )}
                    <p className="font-display font-semibold text-offwhite">
                      {o.totalPrice.currencyCode} {o.totalPrice.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </AccountShell>
  );
}
