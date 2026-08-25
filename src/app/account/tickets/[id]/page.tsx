import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Send, Paperclip } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-session";
import { getCurrentCustomer, deriveDisplayName } from "@/lib/customer-account";
import { listMyTickets } from "@/lib/support-app";
import { submitTicketReply } from "../actions";
import AccountShell from "@/components/account/AccountShell";
import StatusBadge from "@/components/account/StatusBadge";
import TicketStepper from "@/components/account/TicketStepper";
import Reveal from "@/components/Reveal";

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

  const name = deriveDisplayName(customer.firstName, customer.lastName, customer.email);
  const replyWithId = submitTicketReply.bind(null, ticket.id);

  return (
    <AccountShell name={name} email={customer.email} active="tickets">
      <Reveal>
        <Link
          href="/account/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-offwhite/50 transition-colors hover:text-gold"
        >
          <ArrowLeft size={15} />
          Back to tickets
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-offwhite sm:text-3xl">
            {ticket.productModel} · {ticket.colour}
          </h1>
          <StatusBadge status={ticket.status} />
        </div>
        <p className="mt-2 text-sm text-offwhite/50">
          Invoice {ticket.invoiceNumber} · Raised{" "}
          {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        {ticket.invoiceFileDataUrl && (
          <a
            href={ticket.invoiceFileDataUrl}
            download={ticket.invoiceFileName ?? "invoice"}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-gold hover:underline"
          >
            <Paperclip size={14} />
            {ticket.invoiceFileName ?? "Invoice file"}
          </a>
        )}
      </Reveal>

      <Reveal delay={0.05}>
        <div className="glass mt-6 rounded-3xl px-5 py-6 sm:px-8">
          <TicketStepper status={ticket.status} />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-8 space-y-4">
          {ticket.messages.map((m) => {
            const isStaff = m.authorType === "staff";
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isStaff ? "" : "flex-row-reverse"}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold ${
                    isStaff ? "bg-white/10 text-offwhite" : "bg-gold text-black"
                  }`}
                >
                  {isStaff ? "LS" : m.authorName.charAt(0).toUpperCase()}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3.5 sm:max-w-md ${
                    isStaff
                      ? "glass rounded-tl-sm"
                      : "rounded-tr-sm border border-gold/25 bg-gold/[0.07]"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-offwhite/45">
                    {isStaff ? "Leisure Support" : m.authorName}
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-[0.925rem] leading-relaxed text-offwhite/90">
                    {m.body}
                  </p>
                  <p className="mt-2 text-[0.7rem] text-offwhite/35">
                    {new Date(m.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        {ticket.status === "resolved" ? (
          <div className="glass mt-8 flex flex-col items-center gap-3 rounded-3xl px-8 py-10 text-center">
            <CheckCircle2 size={28} className="text-emerald-300" />
            <p className="text-offwhite/70">
              This ticket is resolved. Need something else?
            </p>
            <Link href="/support" className="text-gold hover:underline">
              Raise a new claim
            </Link>
          </div>
        ) : (
          <form action={replyWithId} className="glass mt-8 rounded-3xl p-5 sm:p-6">
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
            <button type="submit" className="btn-gold mt-4 inline-flex items-center gap-2">
              Send
              <Send size={14} />
            </button>
          </form>
        )}
      </Reveal>
    </AccountShell>
  );
}
