import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import WarrantyClaimForm, {
  type ClaimProduct,
} from "@/components/WarrantyClaimForm";
import { getAllProducts } from "@/lib/products";
import { getCustomerSession } from "@/lib/customer-session";
import { getCurrentCustomer, type CustomerIdentity } from "@/lib/customer-account";

export const metadata: Metadata = {
  title: "Support — Leisure",
  description:
    "Register a warranty claim, track the repair process, and reach the Leisure support team. Every Leisure speaker is covered by a 12-month warranty.",
};

const steps = [
  {
    title: "Register the Claim",
    body: "Fill in the form with your model, colour and invoice number. It takes about a minute and gives you a reference number straight away.",
  },
  {
    title: "Invoice Verification",
    body: "We check the invoice against your purchase to confirm the speaker is in warranty. A claim without a valid invoice can't be processed, so keep it handy.",
  },
  {
    title: "Pickup Arranged",
    body: "Once verified, we book a courier to collect the speaker from your address. You'll get the pickup window by SMS — just be around to hand it over.",
  },
  {
    title: "Bench Testing",
    body: "Our audio team inspects and tests the unit to work out whether it qualifies for a repair or a full replacement under warranty.",
  },
  {
    title: "Repair or Replacement",
    body: "Repaired units ship back tuned and retested. If it can't be repaired, we send a replacement as per the warranty terms, with tracking either way.",
  },
];

const covered = [
  "Manufacturing defects in drivers, amplifiers and circuitry",
  "Battery capacity falling below 60% within the warranty period",
  "Charging ports, buttons and switches failing under normal use",
  "Bluetooth pairing faults not resolved by a firmware reset",
];

const notCovered = [
  "Physical damage — drops, cracks, crushed grilles or bent housings",
  "Water ingress beyond the model's rated IP protection",
  "Damage from non-Leisure chargers, adapters or third-party servicing",
  "Normal cosmetic wear such as scuffs, scratches and fabric fade",
];

const channels = [
  {
    label: "Email",
    value: "support@leisureaudio.in",
    href: "mailto:support@leisureaudio.in",
    note: "Replies within one business day",
  },
  {
    label: "Phone",
    value: "+91 98200 00000",
    href: "tel:+919820000000",
    note: "Mon–Sat, 10am – 7pm IST",
  },
  {
    label: "Walk-in",
    value: "Andheri (E), Mumbai 400059",
    href: "/contact",
    note: "By appointment only",
  },
];

export default async function Support() {
  // The claim form only needs identity + colour names, so narrow the catalog
  // down before it crosses into the client bundle.
  const products: ClaimProduct[] = getAllProducts().map((p) => ({
    slug: p.slug,
    model: p.model,
    colors: p.colors.map((c) => c.name),
  }));

  // A ticket must be tied to a real customerId (that's how /account/tickets
  // finds "yours" later), so the form itself is gated behind login rather
  // than collecting contact details from an anonymous visitor.
  const session = await getCustomerSession();
  const customer: CustomerIdentity | null = session
    ? await getCurrentCustomer(session.access_token)
    : null;

  return (
    <main className="overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-5xl px-4 pb-16 pt-36 text-center sm:px-6 sm:pt-44">
        <Reveal>
          <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
            Support
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-offwhite sm:text-7xl">
            Something wrong?
            <br />
            We&apos;ll <span className="text-gold">sort it</span>.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="font-pinyon mt-5 text-3xl text-gold sm:text-4xl">
            Covered for 12 months.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-2xl text-balance text-base leading-relaxed text-offwhite/70 sm:text-lg">
            Every Leisure speaker ships with a 12-month warranty against
            manufacturing defects. Register a claim below and we&apos;ll take it
            from there — verification, pickup, testing and return.
          </p>
        </Reveal>
      </section>

      {/* ── Claim process + form ── */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Process */}
          <div>
            <Reveal>
              <h2 className="font-display text-4xl font-bold text-offwhite sm:text-5xl">
                Warranty claim process
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-4 max-w-lg leading-relaxed text-offwhite/65">
                Five steps from the moment you tell us, to the moment your sound
                is back.
              </p>
            </Reveal>

            <ol className="mt-10 space-y-8">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={0.05 * i}>
                  <li className="relative flex gap-5">
                    {/* Connector rail, skipped on the final step */}
                    {i < steps.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute left-[1.4rem] top-12 h-[calc(100%+1rem)] w-px bg-gradient-to-b from-gold/40 to-transparent"
                      />
                    )}
                    <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-black font-display text-lg font-bold text-gold">
                      {i + 1}
                    </span>
                    <div className="pt-1">
                      <h3 className="font-display text-xl font-semibold text-offwhite">
                        {s.title}
                      </h3>
                      <p className="mt-2 max-w-md leading-relaxed text-offwhite/60">
                        {s.body}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>

          {/* Form — sticks alongside the steps on wide screens */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal delay={0.1}>
              {customer ? (
                <WarrantyClaimForm
                  products={products}
                  defaultName={[customer.firstName, customer.lastName]
                    .filter(Boolean)
                    .join(" ")}
                  defaultEmail={customer.email ?? undefined}
                  defaultPhone={customer.phone ?? undefined}
                />
              ) : (
                <div className="glass rounded-3xl p-8 text-center sm:p-10">
                  <h2 className="font-display text-2xl font-bold text-offwhite sm:text-3xl">
                    Log in to register a claim
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-offwhite/60">
                    So we can find your claim later under{" "}
                    <span className="text-offwhite">My Account</span>, sign in
                    first — it takes a few seconds.
                  </p>
                  <a href="/account/login" className="btn-gold mt-6 inline-block">
                    Log in to continue
                  </a>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── What the warranty covers ── */}
      <section id="warranty" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal>
          <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
            The Fine Print
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display text-4xl font-bold text-offwhite sm:text-5xl">
            What&apos;s covered
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Reveal delay={0.1}>
            <div className="glass h-full rounded-3xl p-8">
              <h3 className="font-display text-xl font-semibold text-gold">
                Covered
              </h3>
              <ul className="mt-5 space-y-4">
                {covered.map((c) => (
                  <li key={c} className="flex gap-3 text-offwhite/70">
                    <span aria-hidden="true" className="mt-2 h-1 w-4 shrink-0 bg-gold" />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="glass h-full rounded-3xl p-8">
              <h3 className="font-display text-xl font-semibold text-offwhite/70">
                Not covered
              </h3>
              <ul className="mt-5 space-y-4">
                {notCovered.map((c) => (
                  <li key={c} className="flex gap-3 text-offwhite/55">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1 w-4 shrink-0 bg-white/25"
                    />
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Contact channels ── */}
      <section className="mx-auto max-w-6xl px-4 pb-28 sm:px-6">
        <Reveal>
          <div className="glass grid gap-8 rounded-3xl px-8 py-12 sm:grid-cols-3">
            {channels.map((c) => (
              <div key={c.label} className="text-center">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold/80">
                  {c.label}
                </p>
                <Link
                  href={c.href}
                  className="mt-3 block font-display text-lg font-semibold text-offwhite transition-colors hover:text-gold"
                >
                  {c.value}
                </Link>
                <p className="mt-2 text-sm text-offwhite/50">{c.note}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </main>
  );
}
