import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Leisure",
  description:
    "Get in touch with Leisure — questions, support, partnerships, or just to say hello. Sound Your Wild.",
};

const channels = [
  {
    label: "Email",
    value: "hello@leisure.audio",
    href: "mailto:hello@leisure.audio",
  },
  {
    label: "Support",
    value: "support@leisure.audio",
    href: "mailto:support@leisure.audio",
  },
  {
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
];

const socials = [
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "X / Twitter", href: "#" },
];

export default function Contact() {
  return (
    <main className="overflow-hidden">
      {/* ── Hero ── */}
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-36 text-center sm:px-6 sm:pt-44">
        <Reveal>
          <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
            Get in Touch
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-offwhite sm:text-7xl">
            Let&apos;s <span className="text-gold">talk</span>.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="font-pinyon mt-4 text-4xl text-gold sm:text-5xl">
            We&apos;re all ears.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-offwhite/70">
            Questions about a speaker, an order, a partnership — or just want to
            tell us how loud you got? Drop us a line.
          </p>
        </Reveal>
      </section>

      {/* ── Grid: info + form ── */}
      <section className="mx-auto max-w-6xl px-4 pb-32 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left — channels */}
          <div className="flex flex-col gap-5">
            <Reveal>
              <div className="glass rounded-3xl p-8">
                <h2 className="font-display text-2xl font-semibold text-offwhite">
                  Reach us directly
                </h2>
                <div className="mt-6 flex flex-col gap-5">
                  {channels.map((c) => (
                    <a
                      key={c.label}
                      href={c.href}
                      className="group block border-l-2 border-gold/30 pl-4 transition-colors hover:border-gold"
                    >
                      <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-offwhite/50">
                        {c.label}
                      </span>
                      <span className="mt-0.5 block text-lg text-offwhite transition-colors group-hover:text-gold">
                        {c.value}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="glass rounded-3xl p-8">
                <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-offwhite/50">
                  Studio
                </span>
                <p className="mt-2 text-lg leading-relaxed text-offwhite/85">
                  Leisure Audio Labs
                  <br />
                  Bandra Kurla Complex
                  <br />
                  Mumbai, India 400051
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      className="rounded-full border border-white/15 px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-offwhite/70 transition-colors hover:border-gold hover:text-gold"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right — form */}
          <Reveal delay={0.12}>
            <ContactForm />
          </Reveal>
        </div>

        {/* ── Map ── */}
        <Reveal delay={0.05}>
          <div className="glass group relative mt-8 overflow-hidden rounded-3xl p-2">
            {/* Gold glow frame accents */}
            <div className="grad-yellow pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl" />
            <div className="grad-yellow pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full opacity-10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[1.35rem]">
              {/* Dark + gold tinted map */}
              <iframe
                title="Leisure Audio Labs — Bandra Kurla Complex, Mumbai"
                src="https://www.openstreetmap.org/export/embed.html?bbox=72.835%2C19.048%2C72.895%2C19.085&layer=mapnik&marker=19.0662%2C72.8690"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[360px] w-full border-0 grayscale-[0.4] invert-[0.92] hue-rotate-[176deg] contrast-[1.05] transition-all duration-500 group-hover:grayscale-0"
              />
              {/* Gold scrim so it reads as black + gold */}
              <div className="pointer-events-none absolute inset-0 mix-blend-overlay [background:radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(251,237,43,0.18),transparent_70%)]" />

              {/* Location pill */}
              <div className="glass pointer-events-none absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold gold-glow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21s7-5.686 7-11a7 7 0 10-14 0c0 5.314 7 11 7 11z"
                      stroke="#000"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="10" r="2.4" stroke="#000" strokeWidth="2" />
                  </svg>
                </span>
                <div>
                  <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold">
                    Leisure Audio Labs
                  </span>
                  <span className="block text-sm text-offwhite/85">
                    Bandra Kurla Complex, Mumbai
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
