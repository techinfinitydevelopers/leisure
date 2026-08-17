import { Fragment } from "react";
import { Check } from "lucide-react";

const STEPS = [
  { key: "registered", label: "Registered" },
  { key: "verifying", label: "Verifying" },
  { key: "pickup", label: "Pickup" },
  { key: "testing", label: "Testing" },
  { key: "resolved", label: "Resolved" },
] as const;

export default function TicketStepper({ status }: { status: string }) {
  const idx = Math.max(
    0,
    STEPS.findIndex((s) => s.key === status)
  );

  return (
    <div className="flex items-start">
      {STEPS.map((step, i) => {
        const complete = i < idx || (i === idx && status === "resolved");
        const current = i === idx && status !== "resolved";
        return (
          <Fragment key={step.key}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                  complete
                    ? "bg-gold text-black"
                    : current
                      ? "border-2 border-gold text-gold"
                      : "border border-white/15 text-offwhite/35"
                }`}
              >
                {complete ? <Check size={13} /> : i + 1}
              </div>
              <span
                className={`hidden text-[10px] font-semibold uppercase tracking-wide sm:block ${
                  complete || current ? "text-offwhite/70" : "text-offwhite/30"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mt-3.5 h-px flex-1 transition-colors ${
                  i < idx ? "bg-gold" : "bg-white/10"
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
