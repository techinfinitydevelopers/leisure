"use server";

import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-session";
import { getCurrentCustomer } from "@/lib/customer-account";
import { createTicket } from "@/lib/support-app";

export type ClaimActionState = { error: string } | null;

export async function submitClaim(
  _prevState: ClaimActionState,
  formData: FormData
): Promise<ClaimActionState> {
  const session = await getCustomerSession();
  if (!session) {
    // Belt-and-braces: the page itself gates the form behind login, but a
    // direct POST (or an expired cookie between page load and submit) should
    // still fail closed rather than create an orphaned, customerId-less ticket.
    return { error: "Your session expired. Please log in again." };
  }
  const customer = await getCurrentCustomer(session.access_token);

  const productSlug = String(formData.get("product") ?? "");
  const products = JSON.parse(String(formData.get("productsJson") ?? "[]")) as {
    slug: string;
    model: string;
  }[];
  const productModel = products.find((p) => p.slug === productSlug)?.model;

  if (!productSlug || !productModel) {
    return { error: "Select a product." };
  }

  const invoiceFile = formData.get("invoiceFile");
  let invoiceFileBase64: string | undefined;
  let invoiceFileName: string | undefined;
  let invoiceFileType: string | undefined;
  if (invoiceFile instanceof File && invoiceFile.size > 0) {
    const MAX_SIZE = 6 * 1024 * 1024;
    if (invoiceFile.size > MAX_SIZE) {
      return { error: "Invoice file is too large. Please keep it under 6MB." };
    }
    const buffer = Buffer.from(await invoiceFile.arrayBuffer());
    invoiceFileBase64 = buffer.toString("base64");
    invoiceFileName = invoiceFile.name;
    invoiceFileType = invoiceFile.type || "application/octet-stream";
  }

  let ticket;
  try {
    ticket = await createTicket({
      customerId: customer.id,
      customerName: String(formData.get("name") ?? ""),
      customerEmail: String(formData.get("email") ?? ""),
      customerPhone: String(formData.get("phone") ?? ""),
      productSlug,
      productModel,
      colour: String(formData.get("color") ?? ""),
      invoiceNumber: String(formData.get("invoice") ?? ""),
      purchaseDate: String(formData.get("purchaseDate") ?? ""),
      pincode: String(formData.get("pincode") ?? ""),
      message: String(formData.get("description") ?? "") || undefined,
      invoiceFileBase64,
      invoiceFileName,
      invoiceFileType,
    });
  } catch (err) {
    console.error("createTicket failed:", err);
    return { error: "Something went wrong submitting your claim. Please try again." };
  }

  redirect(`/account/tickets/${ticket.id}`);
}
