"use server";

import { revalidatePath } from "next/cache";
import { getCustomerSession } from "@/lib/customer-session";
import { getCurrentCustomer, deriveDisplayName } from "@/lib/customer-account";
import { listMyTickets, replyToTicket } from "@/lib/support-app";

export async function submitTicketReply(ticketId: string, formData: FormData) {
  const session = await getCustomerSession();
  if (!session) throw new Error("Not logged in");

  const customer = await getCurrentCustomer(session.access_token);

  // The support app's API doesn't check ownership — anyone with the internal
  // token could reply to any ticket id. That's fine for staff (their own
  // Shopify Admin session already gates them), but a customer-facing action
  // must not let customer A reply into customer B's ticket just by guessing
  // a cuid. Confirm this ticket is actually one of theirs before writing.
  const own = await listMyTickets(customer.id);
  if (!own.some((t) => t.id === ticketId)) {
    throw new Error("Ticket not found");
  }

  const message = String(formData.get("message") ?? "").trim();
  if (!message) return;

  const authorName = deriveDisplayName(customer.firstName, customer.lastName, customer.email);
  await replyToTicket(ticketId, authorName, message);
  revalidatePath(`/account/tickets/${ticketId}`);
}
