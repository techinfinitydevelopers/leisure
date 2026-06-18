"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const BARS = [
  { h: 14, dur: 0.72, del: 0.00 }, { h: 28, dur: 0.88, del: 0.06 },
  { h: 20, dur: 0.65, del: 0.12 }, { h: 44, dur: 0.94, del: 0.03 },
  { h: 32, dur: 0.80, del: 0.09 }, { h: 56, dur: 0.70, del: 0.16 },
  { h: 40, dur: 0.86, del: 0.02 }, { h: 64, dur: 0.78, del: 0.13 },
  { h: 48, dur: 0.66, del: 0.07 }, { h: 72, dur: 0.92, del: 0.04 },
  { h: 52, dur: 0.74, del: 0.11 }, { h: 80, dur: 0.84, del: 0.01 },
  { h: 60, dur: 0.68, del: 0.14 }, { h: 76, dur: 0.90, del: 0.08 },
  { h: 68, dur: 0.76, del: 0.05 }, { h: 84, dur: 0.82, del: 0.15 },
  { h: 84, dur: 0.82, del: 0.15 }, { h: 68, dur: 0.76, del: 0.05 },
  { h: 76, dur: 0.90, del: 0.08 }, { h: 60, dur: 0.68, del: 0.14 },
  { h: 80, dur: 0.84, del: 0.01 }, { h: 52, dur: 0.74, del: 0.11 },
  { h: 72, dur: 0.92, del: 0.04 }, { h: 48, dur: 0.66, del: 0.07 },
  { h: 64, dur: 0.78, del: 0.13 }, { h: 40, dur: 0.86, del: 0.02 },
  { h: 56, dur: 0.70, del: 0.16 }, { h: 32, dur: 0.80, del: 0.09 },
  { h: 44, dur: 0.94, del: 0.03 }, { h: 20, dur: 0.65, del: 0.12 },
  { h: 28, dur: 0.88, del: 0.06 }, { h: 14, dur: 0.72, del: 0.00 },
];

export default function Preloader() {
  const [phase, setPhase] = useState<"show" | "fade" | "done">("show");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fade"), 2200);
    const t2 = setTimeout(() => setPhase("done"), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        backgroundColor: "#070707",
        opacity: phase === "fade" ? 0 : 1,
        transition: "opacity 0.8s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: phase === "fade" ? "none" : "all",
      }}
    >
      {/* Gold bloom behind logo */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(237,196,132,0.10) 0%, transparent 68%)",
          filter: "blur(32px)",
        }}
      />

      {/* Sound ring pulses */}
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 80 + n * 80,
            height: 80 + n * 80,
            border: "1px solid rgba(237,196,132,0.08)",
            animation: `pulse-ring ${1.2 + n * 0.4}s ease-out ${n * 0.3}s infinite`,
          }}
        />
      ))}

      {/* Logo */}
      <div className="relative z-10 mb-10">
        <Image
          src="/brand/leisure-logo.png"
          alt="Leisure"
          width={200}
          height={60}
          priority
          style={{ filter: "brightness(0) invert(1)" }}
        />
      </div>

      {/* EQ spectrum */}
      <div className="relative z-10 flex items-end gap-[3px]">
        {BARS.map((b, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: `${b.h}px`,
              background: "linear-gradient(to top, #c8922a 0%, #edc484 60%, #fff5d6 100%)",
              borderRadius: "2px 2px 0 0",
              transformOrigin: "bottom",
              animation: `eq-bar ${b.dur}s ease-in-out ${b.del}s infinite alternate`,
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {/* Label */}
      <p
        className="relative z-10 mt-6"
        style={{
          fontSize: "0.62rem",
          letterSpacing: "0.30em",
          textTransform: "uppercase",
          color: "rgba(237,196,132,0.40)",
          fontFamily: "var(--font-sf, sans-serif)",
        }}
      >
        Sound Your Wild
      </p>

      <style>{`
        @keyframes pulse-ring {
          0%   { opacity: 0.6; transform: scale(0.85); }
          100% { opacity: 0;   transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
}
