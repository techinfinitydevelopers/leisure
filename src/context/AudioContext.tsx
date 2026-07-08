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
  toggleMute: () => void;
};

const Ctx = createContext<AudioState | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pathname = usePathname();
  const [muted, setMuted] = useState(false);

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

    const tryPlay = () => {
      el.play().catch(() => {
        /* blocked until a user gesture — handled by the listeners below */
      });
    };
    tryPlay();

    // start (unmute-capable) on the first user interaction
    const onFirstGesture = () => {
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

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      const el = audioRef.current;
      if (el) {
        el.muted = next;
        if (!next) el.play().catch(() => {});
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      }
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ muted, toggleMute }}>{children}</Ctx.Provider>;
}

export function useAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
