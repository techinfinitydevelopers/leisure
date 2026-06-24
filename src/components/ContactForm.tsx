"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "sent";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    // Simulated submit — wire to /api when a backend endpoint exists.
    setTimeout(() => setStatus("sent"), 900);
  }

  if (status === "sent") {
    return (
      <div className="glass flex flex-col items-center justify-center rounded-3xl px-8 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold gold-glow">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="#000"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="mt-6 font-display text-3xl font-semibold text-offwhite">
          Message sent.
        </h3>
        <p className="mt-2 max-w-sm text-offwhite/65">
          Thanks for reaching out. Our team will get back to you within one
          business day.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="btn-outline mt-8"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" placeholder="Jordan Reyes" required />
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@email.com"
          required
        />
      </div>
      <div className="mt-5">
        <Field label="Subject" name="subject" placeholder="How can we help?" />
      </div>
      <div className="mt-5">
        <label className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-offwhite/60">
          Message
        </label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell us what's on your mind…"
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-offwhite placeholder:text-offwhite/30 transition-colors focus:border-gold/60 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-gold mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-offwhite/60">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-offwhite placeholder:text-offwhite/30 transition-colors focus:border-gold/60 focus:outline-none"
      />
    </div>
  );
}
