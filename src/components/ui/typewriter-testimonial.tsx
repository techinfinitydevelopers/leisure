"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type Testimonial = {
  image: string;
  text: string;
  name: string;
  jobtitle: string;
  audio?: string;
};

type ComponentProps = {
  testimonials: Testimonial[];
};

export const TypewriterTestimonial: React.FC<ComponentProps> = ({ testimonials }) => {
  const [hoveredIndex, setHoveredIndex]     = useState<number | null>(null);
  const [hasBeenHovered, setHasBeenHovered] = useState<boolean[]>(
    new Array(testimonials.length).fill(false)
  );
  const [typedText, setTypedText]           = useState("");

  const audioRef              = useRef<HTMLAudioElement | null>(null);
  const typeTimerRef          = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
      audioRef.current.load();
      audioRef.current = null;
    }
  }, []);

  const stopTypewriter = useCallback(() => {
    if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
    typeTimerRef.current = null;
    setTypedText("");
  }, []);

  const startTypewriter = useCallback((text: string) => {
    if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
    setTypedText("");
    let i = 0;
    const type = () => {
      if (i <= text.length) {
        setTypedText(text.slice(0, i));
        i++;
        typeTimerRef.current = setTimeout(type, 28);
      }
    };
    type();
  }, []);

  const handleMouseEnter = useCallback(
    (index: number) => {
      stopAudio();
      setHoveredIndex(index);
      setHasBeenHovered((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
      startTypewriter(testimonials[index].text);

      if (testimonials[index].audio) {
        const a = new Audio(`/audio/${testimonials[index].audio}`);
        audioRef.current = a;
        a.play().catch(() => {});
      }
    },
    [testimonials, stopAudio, startTypewriter]
  );

  const handleMouseLeave = useCallback(() => {
    stopAudio();
    setHoveredIndex(null);
    stopTypewriter();
  }, [stopAudio, stopTypewriter]);

  useEffect(() => () => { stopAudio(); stopTypewriter(); }, [stopAudio, stopTypewriter]);

  return (
    <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
      {testimonials.map((t, i) => (
        <motion.div
          key={i}
          className="relative flex flex-col items-center"
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Avatar */}
          <motion.img
            src={t.image}
            alt={t.name}
            className="h-14 w-14 rounded-full object-cover sm:h-16 sm:w-16"
            animate={{
              boxShadow:
                hoveredIndex === i || hasBeenHovered[i]
                  ? "0 0 0 3px #fbed2b, 0 0 18px rgba(251,237,43,0.35)"
                  : "0 0 0 2px rgba(251,237,43,0.25)",
            }}
            transition={{ duration: 0.25 }}
          />

          {/* Pulse ring when hovered */}
          {hoveredIndex === i && (
            <span className="pointer-events-none absolute inset-0 rounded-full border border-gold/60 animate-ping" />
          )}

          {/* Popup bubble */}
          <AnimatePresence>
            {hoveredIndex === i && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 6 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{    opacity: 0, scale: 0.85, y: 6  }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="absolute bottom-[72px] z-50 w-60"
                style={{ left: "50%", transform: "translateX(-50%)" }}
              >
                {/* Card */}
                <div
                  className="relative rounded-2xl px-4 py-4 shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg,#0d0d0d 0%,#000000 100%)",
                    border: "1px solid rgba(251,237,43,0.22)",
                  }}
                >
                  {/* Gold accent top line */}
                  <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

                  {/* Typewriter text */}
                  <p className="min-h-[80px] text-[0.78rem] leading-relaxed text-offwhite/85">
                    &ldquo;{typedText}
                    <span className="animate-pulse text-gold">|</span>&rdquo;
                  </p>

                  {/* Author */}
                  <div className="mt-3 flex items-center gap-2 border-t border-white/8 pt-3">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-[0.72rem] font-semibold text-offwhite">{t.name}</p>
                      <p className="text-[0.65rem] text-gold/70">{t.jobtitle}</p>
                    </div>
                  </div>

                  {/* Tail dots */}
                  <div className="absolute -bottom-[18px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-[3px]">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#0d0d0d] shadow" style={{ border: "1px solid rgba(251,237,43,0.2)" }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-[#0d0d0d] shadow" style={{ border: "1px solid rgba(251,237,43,0.15)" }} />
                    <div className="h-1 w-1 rounded-full bg-[#0d0d0d]" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default TypewriterTestimonial;
