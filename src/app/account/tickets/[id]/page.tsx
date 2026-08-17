import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-session";
import { getCurrentCustomer } from "@/lib/customer-account";
import { listMyTickets } from "@/lib/support-app";
import { submitTicketReply } from "../actions";

const STATUS_LABEL: Record<string, string> = {
  registered: "Registered",
  verifying: "Verifying invoice",
  pickup: "Pickup arranged",
  testing: "Bench testing",
  resolved: "Resolved",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCustomerSession();
  if (!session) redirect("/account/login");

  const customer = await getCurrentCustomer(session.access_token);
  // Same ownership check as the reply action — listing "my" tickets and
  // matching, rather than trusting whatever id is in the URL.
  const tickets = await listMyTickets(customer.id);
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) notFound();

  const replyWithId = submitTicketReply.bind(null, ticket.id);

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-36 sm:px-6 sm:pt-44">
      <Link
        href="/account/tickets"
        className="text-sm text-offwhite/50 transition-colors hover:text-gold"
      >
        ← Back to tickets
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-offwhite">
          {ticket.productModel} · {ticket.colour}
        </h1>
        <span className="shrink-0 rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
          {STATUS_LABEL[ticket.status] ?? ticket.status}
        </span>
      </div>
      <p className="mt-2 text-sm text-offwhite/50">
        Invoice {ticket.invoiceNumber} · Raised{" "}
        {new Date(ticket.createdAt).toLocaleDateString()}
      </p>

      <div className="mt-8 space-y-4">
        {ticket.messages.map((m) => (
          <div
            key={m.id}
            className={`glass rounded-2xl px-5 py-4 ${
              m.authorType === "staff" ? "border border-gold/25" : ""
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-offwhite/50">
              {m.authorType === "staff" ? "Leisure Support" : m.authorName}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-offwhite/85">{m.body}</p>
            <p className="mt-2 text-xs text-offwhite/35">
              {new Date(m.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {ticket.status === "resolved" ? (
        <p className="mt-8 text-center text-sm text-offwhite/50">
          This ticket is resolved. Need something else?{" "}
          <Link href="/support" className="text-gold hover:underline">
            Raise a new claim
          </Link>
          .
        </p>
      ) : (
        <form action={replyWithId} className="mt-8">
          <label
            htmlFor="message"
            className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-offwhite/60"
          >
            Add a reply
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={3}
            placeholder="Add any extra detail for our support team…"
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-offwhite placeholder:text-offwhite/30 transition-colors focus:border-gold/60 focus:outline-none"
          />
          <button type="submit" className="btn-gold mt-4">
            Send
          </button>
        </form>
      )}
    </main>
  );
}
