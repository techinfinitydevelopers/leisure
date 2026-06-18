"use client";

import { motion } from "framer-motion";
import TypewriterTestimonial, { type Testimonial } from "@/components/ui/typewriter-testimonial";

const TESTIMONIALS: Testimonial[] = [
  {
    image: "https://i.pravatar.cc/80?img=11",
    name: "Aryan Mehta",
    jobtitle: "Music Producer, Mumbai",
    text: "The bass hits different — feels like the speaker is alive. Studio-quality sound, without the studio price.",
  },
  {
    image: "https://i.pravatar.cc/80?img=20",
    name: "Priya Nair",
    jobtitle: "DJ & Performer",
    text: "I've tested dozens of Bluetooth speakers. Leisure is the only one that kept up with my sets at full volume.",
  },
  {
    image: "https://i.pravatar.cc/80?img=3",
    name: "Ratan Kapoor",
    jobtitle: "Audiophile, Pune",
    text: "I wasn't expecting retro aesthetics AND audiophile-grade clarity. The highs are crystal clean.",
  },
  {
    image: "https://i.pravatar.cc/80?img=47",
    name: "Simran Batra",
    jobtitle: "Home Decor Enthusiast",
    text: "Literally the most beautiful speaker I've owned. Sits on my shelf like a sculpture. Sounds even better.",
  },
  {
    image: "https://i.pravatar.cc/80?img=52",
    name: "Dev Anand",
    jobtitle: "Trekker & Outdoorsman",
    text: "Took it to Spiti Valley. Cold nights, dust, altitude — not a single issue. Weatherproof and relentless.",
  },
  {
    image: "https://i.pravatar.cc/80?img=29",
    name: "Meera Pillai",
    jobtitle: "Interior Designer",
    text: "My clients always ask where the speaker is from. It elevates any room. Sound is just the bonus.",
  },
  {
    image: "https://i.pravatar.cc/80?img=14",
    name: "Kabir Singh",
    jobtitle: "Party Host, Delhi",
    text: "Filled my entire terrace with sound for six hours straight. Battery life is insane for the size.",
  },
  {
    image: "https://i.pravatar.cc/80?img=60",
    name: "Ananya Raje",
    jobtitle: "Tech Reviewer",
    text: "I gave it a 9.4/10 in my review. The only portable speaker I'd recommend to anyone — at any budget.",
  },
];

export default function TestimonialSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_60%,rgba(237,196,132,0.06),transparent_70%)]" />

      {/* Top separator line */}
      <div className="mx-auto mb-16 h-px max-w-5xl bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
          className="mb-4 text-center"
        >
          <p className="font-pinyon text-3xl text-gold/80 sm:text-4xl">The Verdict</p>
          <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-offwhite sm:text-4xl lg:text-5xl">
            Real People. Real Sound.
          </h2>
          <p className="mt-3 text-sm text-offwhite/45 tracking-wide">
            Hover an avatar to hear what they said.
          </p>
        </motion.div>

        {/* Divider dot row */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          viewport={{ once: true }}
          className="mx-auto mb-14 flex items-center justify-center gap-2"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/40" />
          <div className="h-1.5 w-1.5 rounded-full bg-gold/60" />
          <div className="h-1 w-1 rounded-full bg-gold/30" />
          <div className="h-1.5 w-1.5 rounded-full bg-gold/60" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/40" />
        </motion.div>

        {/* Avatars row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, margin: "-60px" }}
        >
          <TypewriterTestimonial testimonials={TESTIMONIALS} />
        </motion.div>

        {/* Bottom count */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-14 text-center text-[0.7rem] uppercase tracking-[0.2em] text-offwhite/28"
        >
          {TESTIMONIALS.length} verified owners{" · "}avg 4.8 / 5.0
        </motion.p>
      </div>

      {/* Bottom separator */}
      <div className="mx-auto mt-16 h-px max-w-5xl bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  );
}
