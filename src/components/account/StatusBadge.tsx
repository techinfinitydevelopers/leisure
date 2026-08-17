import { Check } from "lucide-react";

export const STATUS_META: Record<string, { label: string; done: boolean }> = {
  registered: { label: "Registered", done: false },
  verifying: { label: "Verifying invoice", done: false },
  pickup: { label: "Pickup arranged", done: false },
  testing: { label: "Bench testing", done: false },
  resolved: { label: "Resolved", done: true },
};

export default function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, done: false };

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        meta.done
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-gold/40 bg-gold/5 text-gold"
      }`}
    >
      {meta.done ? (
        <Check size={12} />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
      )}
      {meta.label}
    </span>
  );
}
