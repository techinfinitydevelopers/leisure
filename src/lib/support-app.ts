// Server-to-server client for leisure-support-app's ticket API. Called only
// from server components / route handlers — never exposed to the browser,
// since it carries INTERNAL_API_TOKEN.
const BASE_URL = process.env.SUPPORT_APP_URL;
const TOKEN = process.env.INTERNAL_API_TOKEN;

export type TicketMessage = {
  id: string;
  authorType: "customer" | "staff";
  authorName: string;
  body: string;
  createdAt: string;
};

export type Ticket = {
  id: string;
  status: "registered" | "verifying" | "pickup" | "testing" | "resolved";
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productSlug: string;
  productModel: string;
  colour: string;
  invoiceNumber: string;
  pincode: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
};

function assertConfigured() {
  if (!BASE_URL || !TOKEN) {
    throw new Error(
      "SUPPORT_APP_URL / INTERNAL_API_TOKEN are not configured — see .env"
    );
  }
}

export async function listMyTickets(customerId: string): Promise<Ticket[]> {
  assertConfigured();
  const res = await fetch(
    `${BASE_URL}/api/tickets?customerId=${encodeURIComponent(customerId)}`,
    {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: "no-store",
    }
  );
  if (!res.ok) {
    throw new Error(`listMyTickets failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.tickets;
}

export async function createTicket(input: {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productSlug: string;
  productModel: string;
  colour: string;
  invoiceNumber: string;
  pincode: string;
  message?: string;
}): Promise<Ticket> {
  assertConfigured();
  const res = await fetch(`${BASE_URL}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`createTicket failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.ticket;
}

export async function replyToTicket(
  ticketId: string,
  authorName: string,
  message: string
): Promise<TicketMessage> {
  assertConfigured();
  const res = await fetch(`${BASE_URL}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ intent: "reply", ticketId, authorName, message }),
  });
  if (!res.ok) {
    throw new Error(`replyToTicket failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.message;
}
