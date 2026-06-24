import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "About — Leisure",
  description:
    "The story behind Leisure — premium retro Bluetooth speakers engineered for powerful sound, modern design, and immersive everyday listening. Sound Your Wild.",
};

const values = [
  {
    title: "Sound First",
    body: "Every driver, chamber, and circuit is tuned by ear and by instrument. We don't ship a speaker until it moves us.",
  },
  {
    title: "Built to Last",
    body: "Aerospace-grade housings, sealed acoustics, and batteries rated for years — not seasons. Leisure is made to outlive trends.",
  },
  {
    title: "Design with Soul",
    body: "Retro silhouettes, modern internals. We design objects you want to leave out on the shelf, not hide in a drawer.",
  },
  {
    title: "Wild by Default",
    body: "Beach, balcony, backseat or basement — Leisure goes where the moment goes. Loud, free, and unmistakably yours.",
  },
];

const stats = [
  { value: "120dB", label: "Peak Output" },
  { value: "40hrs", label: "Playtime" },
  { value: "IP67", label: "Dust + Water" },
  { value: "6", label: "Signature Models" },
];

export default function About() {
  return (
    <main className="overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-5xl px-4 pb-20 pt-36 text-center sm:px-6 sm:pt-44">
        <Reveal>
          <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
            Our Story
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-offwhite sm:text-7xl">
            We build sound
            <br />
            you can <span className="text-gold">feel</span>.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="font-pinyon mt-5 text-4xl text-gold sm:text-5xl">
            Sound Your Wild.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-2xl text-balance text-base leading-relaxed text-offwhite/70 sm:text-lg">
            Leisure began with a simple frustration — speakers that looked like
            gadgets and sounded like compromises. So we built our own: powerful,
            beautiful, and unapologetically loud. Today, every Leisure speaker
            carries that same obsession from the first beat to the last.
          </p>
        </Reveal>
      </section>

      {/* ── Stats band ── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <div className="glass grid grid-cols-2 gap-px overflow-hidden rounded-3xl sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center justify-center bg-black/20 px-4 py-8 text-center"
              >
                <span className="font-display text-3xl font-bold text-gold sm:text-4xl">
                  {s.value}
                </span>
                <span className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-offwhite/60">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── Mission split ── */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
                The Mission
              </p>
              <h2 className="font-display text-4xl font-bold leading-tight text-offwhite sm:text-5xl">
                Engineered for the moment, designed for the shelf.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-offwhite/70">
                We obsess over the things you can&apos;t see — the bracing
                inside the chamber, the curve of a passive radiator, the firmware
                that keeps bass tight at full volume. Then we wrap it in a form
                you actually want to look at.
              </p>
              <p className="mt-4 text-base leading-relaxed text-offwhite/70">
                No bloated apps. No throwaway plastic. Just sound that fills the
                room and a design that earns its place in it.
              </p>
              <Link href="/shop" className="btn-gold mt-8">
                Explore the Collection
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl">
              <div className="grad-y-to-b absolute inset-0 opacity-25" />
              <div className="glass absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-3xl">
                {/* Decorative equalizer */}
                <div className="flex items-end gap-2">
                  {[0.4, 0.8, 0.55, 1, 0.7, 0.3, 0.9, 0.5].map((h, i) => (
                    <span
                      key={i}
                      className="w-2 rounded-full bg-gold gold-glow"
                      style={{
                        height: `${h * 120}px`,
                        animation: `eq-bar ${0.6 + i * 0.12}s ease-in-out ${i * 0.08}s infinite alternate`,
                        transformOrigin: "bottom",
                      }}
                    />
                  ))}
                </div>
                <p className="font-pinyon text-5xl text-gold">Feel every beat.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="mb-12 text-center">
            <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-gold/80">
              What We Stand For
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-offwhite sm:text-5xl">
              Four principles, zero compromise.
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06}>
              <div className="glass group h-full rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40">
                <span className="font-display text-2xl font-bold text-gold/30 transition-colors group-hover:text-gold">
                  0{i + 1}
                </span>
                <h3 className="mt-3 font-display text-2xl font-semibold text-offwhite">
                  {v.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-offwhite/65">
                  {v.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-5xl px-4 pb-32 sm:px-6">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-[2rem] px-8 py-16 text-center sm:py-20">
            <div className="grad-yellow absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl" />
            <h2 className="font-display text-4xl font-bold tracking-tight text-offwhite sm:text-5xl">
              Ready to sound your wild?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-offwhite/70">
              Find the Leisure speaker built for your kind of loud.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/shop" className="btn-gold">
                Shop the Collection
              </Link>
              <Link href="/contact" className="btn-outline">
                Talk to Us
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
