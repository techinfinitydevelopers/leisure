"use client";

import { useEffect, useState } from "react";

type PaymentSetting = {
  id: number;
  provider: string;
  label: string;
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  active: boolean;
};

const PROVIDERS = [
  {
    provider: "razorpay",
    label: "Razorpay",
    logo: "🟦",
    desc: "India's most popular payment gateway. Supports UPI, Cards, Netbanking, Wallets.",
    fields: ["keyId", "keySecret", "webhookSecret"],
    placeholders: { keyId: "rzp_live_xxxxxxxxxxxx", keySecret: "••••••••••••", webhookSecret: "whsec_••••••••" },
    labels: { keyId: "Key ID", keySecret: "Key Secret", webhookSecret: "Webhook Secret" },
    docsUrl: "https://razorpay.com/docs/",
  },
  {
    provider: "stripe",
    label: "Stripe",
    logo: "🟣",
    desc: "International payments. Supports Cards, Wallets, Buy Now Pay Later.",
    fields: ["keyId", "keySecret", "webhookSecret"],
    placeholders: { keyId: "pk_live_xxxxxxxxxxxx", keySecret: "sk_live_••••••••", webhookSecret: "whsec_••••••••" },
    labels: { keyId: "Publishable Key", keySecret: "Secret Key", webhookSecret: "Webhook Secret" },
    docsUrl: "https://stripe.com/docs/",
  },
  {
    provider: "cod",
    label: "Cash on Delivery",
    logo: "💵",
    desc: "Let customers pay when the order is delivered. No API keys needed.",
    fields: [],
    placeholders: {},
    labels: {},
    docsUrl: null,
  },
  {
    provider: "upi",
    label: "UPI / QR Code",
    logo: "📲",
    desc: "Accept payments via UPI ID or QR Code. Enter your UPI ID below.",
    fields: ["keyId"],
    placeholders: { keyId: "yourbusiness@upi" },
    labels: { keyId: "UPI ID" },
    docsUrl: null,
  },
];

export default function PaymentsPage() {
  const [settings, setSettings] = useState<Record<string, PaymentSetting>>({});
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<Record<string, Partial<PaymentSetting>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((data: PaymentSetting[]) => {
        const map: Record<string, PaymentSetting> = {};
        for (const s of data) map[s.provider] = s;
        setSettings(map);
        setLoading(false);
      });
  }, []);

  async function handleSave(provider: string) {
    setSaving(provider);
    const existing = settings[provider];
    const form = forms[provider] ?? {};

    const body = {
      provider,
      label: PROVIDERS.find((p) => p.provider === provider)?.label ?? provider,
      keyId: form.keyId ?? existing?.keyId ?? "",
      keySecret: form.keySecret ?? existing?.keySecret ?? "",
      webhookSecret: form.webhookSecret ?? existing?.webhookSecret ?? "",
      active: form.active !== undefined ? form.active : (existing?.active ?? true),
    };

    const res = await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      setSettings((prev) => ({ ...prev, [provider]: data }));
      setForms((prev) => ({ ...prev, [provider]: {} }));
      setSaved(provider);
      setTimeout(() => setSaved(null), 2000);
    }
    setSaving(null);
  }

  if (loading) {
    return <div className="py-20 text-center text-offwhite/40">Loading…</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-offwhite">Payment Gateway</h1>
        <p className="mt-1 text-sm text-offwhite/50">Configure payment providers for your store</p>
      </div>

      <div className="space-y-4">
        {PROVIDERS.map((p) => {
          const setting = settings[p.provider];
          const form = forms[p.provider] ?? {};
          const isActive = form.active !== undefined ? form.active : (setting?.active ?? false);

          return (
            <div key={p.provider} className="rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.logo}</span>
                  <div>
                    <p className="font-semibold text-offwhite">{p.label}</p>
                    <p className="text-xs text-offwhite/40">{p.desc}</p>
                  </div>
                </div>
                <label className="flex cursor-pointer items-center gap-2">
                  <span className="text-xs text-offwhite/50">{isActive ? "Enabled" : "Disabled"}</span>
                  <div
                    onClick={() => setForms((prev) => ({ ...prev, [p.provider]: { ...form, active: !isActive } }))}
                    className={`relative h-5 w-9 rounded-full transition-colors ${isActive ? "bg-gold" : "bg-white/20"}`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-black transition-transform ${isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                </label>
              </div>

              <div className="px-6 py-5">
                {p.fields.length === 0 ? (
                  <p className="text-sm text-offwhite/40">No configuration required. Toggle above to enable COD.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {p.fields.map((field) => (
                      <div key={field}>
                        <label className="block text-[0.7rem] uppercase tracking-wider text-offwhite/40 mb-1.5">
                          {p.labels[field as keyof typeof p.labels]}
                        </label>
                        <input
                          type={field.toLowerCase().includes("secret") ? "password" : "text"}
                          value={form[field as keyof typeof form] as string ?? setting?.[field as keyof PaymentSetting] as string ?? ""}
                          onChange={(e) =>
                            setForms((prev) => ({
                              ...prev,
                              [p.provider]: { ...form, [field]: e.target.value },
                            }))
                          }
                          placeholder={p.placeholders[field as keyof typeof p.placeholders]}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-offwhite placeholder-offwhite/20 focus:border-gold/50 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSave(p.provider)}
                    disabled={saving === p.provider}
                    className="rounded-xl bg-gold px-5 py-2 text-sm font-bold text-black transition-all hover:bg-gold/90 disabled:opacity-50"
                  >
                    {saving === p.provider ? "Saving…" : "Save"}
                  </button>
                  {saved === p.provider && (
                    <span className="text-sm text-green-400">✓ Saved</span>
                  )}
                  {p.docsUrl && (
                    <a
                      href={p.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-offwhite/30 hover:text-gold"
                    >
                      Documentation →
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
        <p className="text-sm font-medium text-yellow-400">⚠ Production Note</p>
        <p className="mt-1 text-sm text-offwhite/50">
          API keys are stored in the database. For production, consider using environment variables and a secrets manager.
          Never commit keys to version control.
        </p>
      </div>
    </div>
  );
}
