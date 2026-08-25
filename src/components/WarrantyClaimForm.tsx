"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { submitClaim, type ClaimActionState } from "@/app/support/actions";

export type ClaimProduct = {
  slug: string;
  model: string;
  colors: string[];
};

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-offwhite placeholder:text-offwhite/30 transition-colors focus:border-gold/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-45";

const labelClass =
  "mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-offwhite/60";

export default function WarrantyClaimForm({
  products,
  defaultName,
  defaultEmail,
  defaultPhone,
}: {
  products: ClaimProduct[];
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
}) {
  const [productSlug, setProductSlug] = useState("");
  // On success the action redirect()s to the ticket thread, so this state
  // only ever has to represent "still here because something went wrong".
  const [state, formAction, pending] = useActionState<ClaimActionState, FormData>(
    submitClaim,
    null
  );

  // Colours are per-model, so the colour list can only be built once a model
  // is chosen — the same reason the reference form gates its second dropdown.
  // It also matters for the mismatch warning below: a claim is checked against
  // the exact model + colour printed on the box.
  const colors = useMemo(
    () => products.find((p) => p.slug === productSlug)?.colors ?? [],
    [products, productSlug]
  );

  return (
    <form action={formAction} className="glass rounded-3xl p-6 sm:p-8">
      <input type="hidden" name="productsJson" value={JSON.stringify(products)} />
      <h2 className="font-display text-2xl font-bold text-offwhite sm:text-3xl">
        Register a Claim
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-offwhite/60">
        Takes about a minute. Keep your invoice handy.
      </p>

      <div className="mt-7 grid gap-5">
        <div>
          <label htmlFor="claim-product" className={labelClass}>
            Product
          </label>
          <select
            id="claim-product"
            name="product"
            required
            value={productSlug}
            onChange={(e) => setProductSlug(e.target.value)}
            className={inputClass}
          >
            <option value="">Select your speaker</option>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="claim-color" className={labelClass}>
            Colour
          </label>
          <select
            id="claim-color"
            name="color"
            required
            disabled={!productSlug}
            defaultValue=""
            className={inputClass}
          >
            <option value="">
              {productSlug ? "Select colour" : "Select a product first"}
            </option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="claim-name" className={labelClass}>
              Full Name
            </label>
            <input
              id="claim-name"
              name="name"
              required
              defaultValue={defaultName}
              placeholder="Jordan Reyes"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="claim-phone" className={labelClass}>
              Phone
            </label>
            <input
              id="claim-phone"
              name="phone"
              type="tel"
              required
              defaultValue={defaultPhone}
              inputMode="numeric"
              pattern="[0-9+ ]{10,15}"
              placeholder="98200 00000"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="claim-email" className={labelClass}>
              Email
            </label>
            <input
              id="claim-email"
              name="email"
              type="email"
              required
              defaultValue={defaultEmail}
              placeholder="you@email.com"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="claim-pincode" className={labelClass}>
              Pincode
            </label>
            <input
              id="claim-pincode"
              name="pincode"
              required
              inputMode="numeric"
              pattern="[0-9]{6}"
              placeholder="Eg. 400059"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="claim-invoice" className={labelClass}>
              Order / Invoice Number
            </label>
            <input
              id="claim-invoice"
              name="invoice"
              required
              placeholder="From your purchase confirmation"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="claim-purchase-date" className={labelClass}>
              Date of Purchase
            </label>
            <input
              id="claim-purchase-date"
              name="purchaseDate"
              type="date"
              required
              max={new Date().toISOString().split("T")[0]}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="claim-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="claim-description"
            name="description"
            required
            rows={4}
            placeholder="What's wrong with your speaker?"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="claim-invoice-file" className={labelClass}>
            Invoice Photo / PDF{" "}
            <span className="normal-case tracking-normal text-offwhite/40">
              (optional, speeds up verification)
            </span>
          </label>
          <input
            id="claim-invoice-file"
            name="invoiceFile"
            type="file"
            accept="image/*,.pdf"
            className={`${inputClass} file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-wide file:text-black`}
          />
        </div>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 h-4 w-4 shrink-0 accent-gold"
        />
        <span className="text-sm leading-relaxed text-offwhite/70">
          I agree to the{" "}
          <Link href="/support#warranty" className="text-gold hover:underline">
            Warranty Policy
          </Link>{" "}
          and confirm the details above are correct.
        </span>
      </label>

      <p className="mt-4 text-xs leading-relaxed text-offwhite/45">
        Please make sure the model and colour you selected match what is printed
        on the box or invoice. Claims with mismatched details are liable to be
        rejected.
      </p>

      {state?.error && (
        <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-gold mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit Claim"}
      </button>

      <div className="mt-7 border-t border-white/10 pt-6 text-center text-sm text-offwhite/60">
        <p>
          Bought a Leisure speaker as a corporate gift?{" "}
          <Link href="/contact" className="text-gold hover:underline">
            Contact us
          </Link>
        </p>
        <p className="mt-3">
          Not a warranty issue?{" "}
          <Link href="/contact" className="text-gold hover:underline">
            Talk to support
          </Link>
        </p>
      </div>
    </form>
  );
}
