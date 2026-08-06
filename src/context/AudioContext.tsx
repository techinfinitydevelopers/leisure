"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

// Global site-wide background audio. Plays on every page. Because browsers block
// audible autoplay, we start it on the user's first interaction (any click /
// scroll / key / touch) — which feels like autoplay in practice. On a full
// reload or when a new page is opened it restarts from the beginning.

const SRC = "/audio/ambient.mp3";
const STORAGE_KEY = "leisure-sound-muted";

type AudioState = {
  muted: boolean;
  /** Whether the element is actually playing. Autoplay-with-sound is blocked
      until a user gesture, so `!muted` alone does NOT mean audible. */
  playing: boolean;
  /** Turn sound on/off by intent — see the implementation for why this isn't
      a plain mute flip. */
  toggleSound: () => void;
};

const Ctx = createContext<AudioState | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pathname = usePathname();
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);

  // create the audio element once
  useEffect(() => {
    const saved =
      typeof window !== "undefined" &&
      window.localStorage.getItem(STORAGE_KEY) === "1";
    setMuted(saved);

    const el = new Audio(SRC);
    el.loop = true;
    el.preload = "auto";
    el.muted = saved;
    audioRef.current = el;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);

    const tryPlay = () => {
      el.play().catch(() => {
        /* blocked until a user gesture — handled by the listeners below */
      });
    };
    tryPlay();

    // start (unmute-capable) on the first user interaction
    const onFirstGesture = (e: Event) => {
      // If the gesture IS the sound toggle, stand down and let its own click
      // handler decide. This fires on pointerdown — i.e. BEFORE the click — so
      // starting playback here would make the toggle read "already audible"
      // and immediately turn it back off, costing the user a second click.
      const t = e.target;
      if (t instanceof Element && t.closest("[data-sound-toggle]")) return;

      tryPlay();
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
      window.removeEventListener("scroll", onFirstGesture);
    };
    window.addEventListener("pointerdown", onFirstGesture);
    window.addEventListener("keydown", onFirstGesture);
    window.addEventListener("touchstart", onFirstGesture);
    window.addEventListener("scroll", onFirstGesture, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
      window.removeEventListener("scroll", onFirstGesture);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.pause();
      el.src = "";
      audioRef.current = null;
    };
  }, []);

  // pause when the tab/window is hidden (user switched tabs), resume on return
  useEffect(() => {
    const onVisibility = () => {
      const el = audioRef.current;
      if (!el) return;
      if (document.hidden) {
        el.pause();
      } else {
        el.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // restart from the beginning whenever a new page is opened (client-side nav)
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {});
  }, [pathname]);

  // Intent-based ("turn sound on/off"), NOT a plain mute flip. On first load
  // the player is unmuted but silent, because autoplay-with-sound stays
  // blocked until a user gesture — so flipping `muted` would mute an already
  // silent player and force a second click to actually hear anything.
  // `el.paused`/`el.muted` are read live rather than from state, so this is
  // correct even if the element's status changed outside React.
  const toggleSound = useCallback(() => {
    const el = audioRef.current;
    const audible = !!el && !el.paused && !el.muted;
    const nextMuted = audible; // audible -> turn it off; otherwise -> turn it on
    if (el) {
      el.muted = nextMuted;
      if (!nextMuted) el.play().catch(() => {});
    }
    setMuted(nextMuted);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextMuted ? "1" : "0");
    }
  }, []);

  return (
    <Ctx.Provider value={{ muted, playing, toggleSound }}>{children}</Ctx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
