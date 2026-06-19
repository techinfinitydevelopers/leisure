"use client";

const ITEMS = [
  { text: "LEISURE AUDIO", accent: true },
  { text: "RETRO SOUL", accent: false },
  { text: "DRIFT", accent: false },
  { text: "EDGE", accent: false },
  { text: "CORE", accent: false },
  { text: "LEGEND", accent: false },
  { text: "ELEVATE", accent: false },
  { text: "DOMINATOR", accent: false },
  { text: "SOUND YOUR WILD", accent: true },
  { text: "BLUETOOTH SPEAKERS", accent: false },
  { text: "MADE FOR THE BOLD", accent: true },
  { text: "PREMIUM AUDIO", accent: false },
];

// Duplicate for seamless loop
const TRACK = [...ITEMS, ...ITEMS];

const DOT = (
  <span
    aria-hidden="true"
    className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold/50 align-middle"
  />
);

export default function MarqueeBand() {
  return (
    <div className="relative w-full overflow-hidden border-y border-white/8 bg-black/60 py-4 backdrop-blur-sm">
      {/* Edge fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-black to-transparent" />

      {/* Scrolling track — pure CSS animation, no JS */}
      <div
        className="flex w-max items-center gap-6 will-change-transform"
        style={{
          animation: "marquee-scroll 30s linear infinite",
        }}
      >
        {TRACK.map((item, i) => (
          <span key={i} className="flex items-center gap-6 whitespace-nowrap">
            <span
              className="font-display text-[0.7rem] font-bold tracking-[0.28em] uppercase"
              style={{ color: item.accent ? "#fbed2b" : "rgba(255,255,255,0.35)" }}
            >
              {item.text}
            </span>
            {DOT}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
