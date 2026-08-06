"use client";

import { useAudio } from "@/context/AudioContext";

// Footer sound control: the decorative speaker ripple is a live sound toggle.
// Ripple rings animate while sound is audible; a slash + muted icon show when off.
export default function SoundToggle() {
  const { muted, playing, toggleSound } = useAudio();
  // Reflect what the user can actually HEAR, not the mute flag alone. On first
  // load the player is unmuted but silent (autoplay-with-sound is blocked until
  // a gesture), so keying off `muted` showed an "on" speaker over silence.
  const soundOn = playing && !muted;

  return (
    <button
      type="button"
      // Marks this subtree so AudioContext's first-gesture autoplay handler
      // defers to this button instead of racing its own pointerdown.
      data-sound-toggle
      onClick={toggleSound}
      aria-pressed={soundOn}
      aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
      title={soundOn ? "Turn sound off" : "Turn sound on"}
      className="relative flex h-16 w-16 items-center justify-center outline-none"
    >
      {/* Ripple rings — only animate when sound is actually audible */}
      {soundOn &&
        [0, 0.8, 1.6].map((delay) => (
          <span
            key={delay}
            className="absolute inset-0 rounded-full border border-gold/30"
            style={{ animation: `ripple-ring 2.4s ease-out ${delay}s infinite` }}
          />
        ))}
      {/* Speaker cone SVG */}
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-velvet/60 transition-colors hover:border-gold/70">
        {!soundOn ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-gold/70">
            <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" opacity="0.9" />
            <line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-gold">
            <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" opacity="0.9" />
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="currentColor" opacity="0.7" />
            <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor" opacity="0.4" />
          </svg>
        )}
      </div>
    </button>
  );
}
