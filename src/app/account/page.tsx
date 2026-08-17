import type { Metadata } from "next";
import Link from "next/link";
import { getCustomerSession } from "@/lib/customer-session";
import { customerAccountQuery } from "@/lib/customer-account";

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
      <main className="mx-auto max-w-md px-4 pb-24 pt-40 text-center sm:px-6">
        <h1 className="font-display text-4xl font-bold text-offwhite">
          My Account
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
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-36 sm:px-6 sm:pt-44">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
            My Account
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-offwhite">
            {name || "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-offwhite/50">
            {customer.emailAddress?.emailAddress}
          </p>
        </div>
        <a href="/account/logout" className="btn-outline shrink-0">
          Log out
        </a>
      </div>

      <div className="mt-10 flex gap-6 border-b border-white/10">
        <span className="border-b-2 border-gold pb-3 text-sm font-semibold text-offwhite">
          Orders
        </span>
        <Link
          href="/account/tickets"
          className="pb-3 text-sm font-semibold text-offwhite/50 transition-colors hover:text-gold"
        >
          Warranty Tickets
        </Link>
      </div>

      <div className="mt-8">
        {customer.orders.nodes.length === 0 ? (
          <p className="text-offwhite/60">No orders yet.</p>
        ) : (
          <div className="glass divide-y divide-white/10 rounded-3xl">
            {customer.orders.nodes.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="font-semibold text-offwhite">{o.name}</p>
                  <p className="text-sm text-offwhite/50">
                    {new Date(o.processedAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-offwhite/80">
                  {o.totalPrice.currencyCode} {o.totalPrice.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
