"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { getProduct } from "@/lib/products";

gsap.registerPlugin(ScrollTrigger);

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const product = getProduct("edge")!;

/* ─── Section data for the 3-section GSAP pin ─── */
const SECTIONS = [
  {
    img: "/products/edge/black/1.jpg",
    side: "left",
    tag: "POWER",
    heading: "50 Watts\nof Pure\nCommand.",
    specs: [
      { k: "OUTPUT", v: "15W×2 + 10W×2" },
      { k: "FREQ",   v: "20 Hz – 20 KHz" },
      { k: "PEAK",   v: "Cinema-grade" },
    ],
  },
  {
    img: "/products/edge/black/2.jpg",
    side: "right",
    tag: "ENDURANCE",
    heading: "16 Hours.\nUnplug\nthe Room.",
    specs: [
      { k: "BATTERY",  v: "10,000 mAh" },
      { k: "CHARGE",   v: "40W fast charge" },
      { k: "CHARGE TIME", v: "3.5 hours" },
    ],
  },
  {
    img: "/products/edge/orange/1.jpg",
    side: "left",
    tag: "CONNECTIVITY",
    heading: "5-in-1.\nAnywhere\nYou Go.",
    specs: [
      { k: "INPUTS",     v: "BT · AUX · USB · TWS · Optical" },
      { k: "BLUETOOTH",  v: "5.3 · 30m range" },
      { k: "WEIGHT",     v: "2.17 kg" },
    ],
  },
];

export default function V9Page() {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const heroRef    = useRef<HTMLDivElement>(null);
  const spotRef    = useRef<HTMLDivElement>(null);
  const pinRef     = useRef<HTMLDivElement>(null);
  const imgRef     = useRef<HTMLDivElement>(null);
  const dot0 = useRef<HTMLDivElement>(null);
  const dot1 = useRef<HTMLDivElement>(null);
  const dot2 = useRef<HTMLDivElement>(null);

  /* ── Framer Motion mouse-follow ── */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 120, damping: 18 };
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [14, -14]), spring);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), spring);

  const onHeroMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = heroRef.current!.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
    if (spotRef.current) {
      spotRef.current.style.left = `${e.clientX - r.left}px`;
      spotRef.current.style.top  = `${e.clientY - r.top}px`;
    }
  };
  const onHeroLeave = () => { mx.set(0); my.set(0); };

  /* ── GSAP ScrollTrigger (custom scroller = .v9-wrap) ── */
  useGSAP(
    () => {
      const scroller = wrapRef.current;
      if (!scroller || !pinRef.current || !imgRef.current) return;

      // Tell GSAP to use our custom overflow container
      ScrollTrigger.scrollerProxy(scroller, {
        scrollTop(v) {
          if (arguments.length) scroller.scrollTop = v as number;
          return scroller.scrollTop;
        },
        getBoundingClientRect() {
          return {
            top: 0, left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
      });
      scroller.addEventListener("scroll", ScrollTrigger.update);

      const vw = window.innerWidth;
      // image width ~42vw, left at 5vw → right position
      const imgW   = Math.min(vw * 0.42, 500);
      const leftX  = vw * 0.05;
      const rightX = vw - imgW - vw * 0.05;

      const dots = [dot0.current, dot1.current, dot2.current];
      const setDots = (idx: number) => {
        dots.forEach((d, i) => {
          if (!d) return;
          d.style.opacity   = i === idx ? "1"       : "0.22";
          d.style.transform = i === idx ? "scaleY(2.8)" : "scaleY(1)";
        });
      };
      setDots(0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          scroller,
          pin: true,
          start: "top top",
          end: "+=200%",
          scrub: 1.2,
          onUpdate(self) {
            const p = self.progress;
            setDots(p < 0.33 ? 0 : p < 0.66 ? 1 : 2);
          },
        },
      });

      // Image move labels
      tl.addLabel("s1", 0)
        .addLabel("s2", 0.5)
        .addLabel("end", 1);

      /* s1 → s2: image slides LEFT → RIGHT, text 0 out, text 1 in */
      tl.to(imgRef.current, {
        x: rightX - leftX,
        ease: "power2.inOut",
        duration: 0.5,
      }, "s1")
        .to(".v9-t0", { opacity: 0, y: -30, ease: "power2.in", duration: 0.25 }, "s1")
        .to(".v9-t1", { opacity: 1, y: 0,   ease: "power2.out", duration: 0.25 }, "s1+=0.25");

      /* s2 → end: image slides RIGHT → LEFT, text 1 out, text 2 in */
      tl.to(imgRef.current, {
        x: 0,
        ease: "power2.inOut",
        duration: 0.5,
      }, "s2")
        .to(".v9-t1", { opacity: 0, y: -30, ease: "power2.in", duration: 0.25 }, "s2")
        .to(".v9-t2", { opacity: 1, y: 0,   ease: "power2.out", duration: 0.25 }, "s2+=0.25");

      return () => {
        scroller.removeEventListener("scroll", ScrollTrigger.update);
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    },
    { scope: wrapRef, dependencies: [] }
  );

  return (
    <>
      <style>{`
        @keyframes v9-grain {
          0%  { transform:translate(0,0); }
          25% { transform:translate(-1%,-1.5%); }
          50% { transform:translate(1.5%,1%); }
          75% { transform:translate(-1%,1.5%); }
          100%{ transform:translate(0,0); }
        }
        .v9-grain {
          animation: v9-grain .09s steps(1) infinite;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 300px 300px;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        .v9-badge {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.7);
          font-weight: 700;
          white-space: nowrap;
        }
        .v9-spec-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
        .v9-spec-row:last-child { border-bottom:none; }
      `}</style>

      <div ref={wrapRef} className="v9-wrap fixed inset-0 z-[100] overflow-y-auto" style={{ background: "#070604" }}>

        {/* ══ HERO — mouse-driven 3D tilt ══ */}
        <section
          ref={heroRef}
          className="relative h-dvh flex items-center justify-center overflow-hidden"
          onMouseMove={onHeroMove}
          onMouseLeave={onHeroLeave}
        >
          {/* BG */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(251,237,43,0.04), transparent 55%)" }} />
          <div className="v9-grain absolute inset-[-15%] opacity-20 z-[1]" />

          {/* Mouse spotlight */}
          <div
            ref={spotRef}
            className="pointer-events-none absolute z-0"
            style={{
              width: 600, height: 600, borderRadius: "50%",
              transform: "translate(-50%,-50%)",
              background: "radial-gradient(circle, rgba(251,237,43,0.07), transparent 60%)",
            }}
          />

          {/* 3D card wrapper */}
          <div style={{ perspective: "1100px" }} className="relative z-10">
            <motion.div
              style={{
                rotateX: rotX,
                rotateY: rotY,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Product image */}
              <div
                className="relative"
                style={{
                  width: "clamp(260px, 36vw, 520px)",
                  aspectRatio: "1 / 1",
                  transformStyle: "preserve-3d",
                }}
              >
                <Image
                  src="/products/edge/black/1.jpg"
                  alt="Leisure EDGE"
                  fill
                  className="object-contain"
                  style={{ filter: "brightness(0.96) drop-shadow(0 40px 80px rgba(0,0,0,0.7))" }}
                  priority
                />

                {/* Floating badges — each at different Z depth */}
                <div className="v9-badge absolute" style={{ top: "8%", right: "-22%", transform: "translateZ(55px)" }}>
                  50W OUTPUT
                </div>
                <div className="v9-badge absolute" style={{ top: "42%", left: "-28%", transform: "translateZ(40px)" }}>
                  10,000 mAh
                </div>
                <div className="v9-badge absolute" style={{ bottom: "12%", right: "-18%", transform: "translateZ(35px)" }}>
                  5-IN-1
                </div>

                {/* Ground shadow */}
                <div
                  className="absolute inset-x-[10%]"
                  style={{
                    height: "8%", bottom: "-14%",
                    transform: "translateZ(-40px) rotateX(90deg)",
                    background: "radial-gradient(ellipse, rgba(0,0,0,0.5), transparent 70%)",
                    borderRadius: "50%",
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* Title */}
          <div className="absolute bottom-12 left-12 z-10">
            <p className="text-[8px] tracking-[0.45em] text-white/22 mb-2">LEISURE AUDIO PRESENTS</p>
            <h1 className="font-black text-white leading-none"
              style={{ fontSize: "clamp(72px, 12vw, 155px)", letterSpacing: "-0.04em" }}>
              EDGE.
            </h1>
            <div className="mt-4 flex items-center gap-5">
              <p className="text-lg font-black text-[#fbed2b]">{inr.format(product.price)}</p>
              <Link href="/product/edge"
                className="rounded-full bg-white px-7 py-2.5 text-[10px] font-black tracking-[0.15em] text-black transition hover:bg-[#fbed2b] hover:scale-105">
                BUY NOW →
              </Link>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-12 right-12 z-10 flex items-center gap-2 opacity-30">
            <div className="h-px w-10 bg-white" />
            <span className="text-[8px] tracking-[0.2em] text-white">SCROLL</span>
          </div>

          {/* Nav */}
          <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-10 py-7">
            <Link href="/" className="text-[10px] tracking-[0.18em] text-white/30 hover:text-white transition">← BACK</Link>
            <span className="text-[14px] font-black tracking-[0.28em] text-white">LEISURE.</span>
            <Link href="/shop" className="rounded-full border border-white/12 px-5 py-2 text-[10px] tracking-[0.1em] text-white/38 transition hover:border-white/40 hover:text-white">
              Shop
            </Link>
          </nav>
        </section>

        {/* ══ GSAP PIN — 3-section scroll journey ══ */}
        <div ref={pinRef} className="relative overflow-hidden" style={{ height: "100vh" }}>

          <div className="absolute inset-0" style={{ background: "#070604" }} />
          <div className="v9-grain absolute inset-[-15%] opacity-15 z-[1]" />

          {/* Center divider */}
          <div className="pointer-events-none absolute top-16 bottom-16 left-1/2 z-[2]"
            style={{ width: 1, background: "rgba(255,255,255,0.05)" }} />

          {/* Section dots */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
            {[dot0, dot1, dot2].map((d, i) => (
              <div
                key={i}
                ref={d}
                className="w-0.5 h-2 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  opacity: 0.22,
                  transition: "transform .4s ease, opacity .4s ease",
                }}
              />
            ))}
          </div>

          {/* ── Sliding product image ── */}
          <div
            ref={imgRef}
            className="absolute top-1/2 -translate-y-1/2 z-10"
            style={{
              left: "5vw",
              width: "clamp(240px, 42vw, 500px)",
              willChange: "transform",
            }}
          >
            <div style={{ position: "relative", width: "100%", paddingBottom: "85%" }}>
              {SECTIONS.map((s, i) => (
                <div key={i} className="absolute inset-0"
                  style={{ opacity: 0, transition: "opacity 0.4s ease" }}
                  id={`v9-img-${i}`}>
                  <Image src={s.img} alt={`EDGE view ${i + 1}`} fill
                    className="object-contain"
                    style={{ filter: "brightness(0.95) drop-shadow(0 30px 60px rgba(0,0,0,0.6))" }}
                    priority={i === 0} />
                </div>
              ))}
              {/* First image visible by default */}
              <div className="absolute inset-0">
                <Image src={SECTIONS[0].img} alt="EDGE" fill
                  className="object-contain"
                  style={{ filter: "brightness(0.95) drop-shadow(0 30px 60px rgba(0,0,0,0.6))" }}
                  priority />
              </div>
            </div>
          </div>

          {/* ── Text block 0: LEFT position (section 1 & 3), visible at start ── */}
          <div
            className="v9-t0 absolute top-1/2 -translate-y-1/2 z-10"
            style={{ right: "5vw", width: "clamp(240px, 36vw, 440px)" }}
          >
            <p className="text-[8px] tracking-[0.45em] text-white/20 mb-4">{SECTIONS[0].tag}</p>
            <h2 className="font-black text-white leading-none mb-6"
              style={{ fontSize: "clamp(40px, 6vw, 80px)", letterSpacing: "-0.035em", whiteSpace: "pre-line" }}>
              {SECTIONS[0].heading}
            </h2>
            <div>
              {SECTIONS[0].specs.map(sp => (
                <div key={sp.k} className="v9-spec-row">
                  <span className="text-[8px] tracking-[0.2em] text-white/22">{sp.k}</span>
                  <span className="text-[11px] font-semibold text-white/55">{sp.v}</span>
                </div>
              ))}
            </div>
            <div className="mt-7">
              <p className="text-[8px] tracking-[0.15em] text-white/18 mb-1">FROM</p>
              <p className="text-xl font-black text-[#fbed2b]">{inr.format(product.price)}</p>
            </div>
          </div>

          {/* ── Text block 1: RIGHT position (section 2), image on right ── */}
          <div
            className="v9-t1 absolute top-1/2 -translate-y-1/2 z-10"
            style={{
              left: "5vw",
              width: "clamp(240px, 36vw, 440px)",
              opacity: 0,
              transform: "translateY(-50%) translateY(30px)",
            }}
          >
            <p className="text-[8px] tracking-[0.45em] text-white/20 mb-4">{SECTIONS[1].tag}</p>
            <h2 className="font-black text-white leading-none mb-6"
              style={{ fontSize: "clamp(40px, 6vw, 80px)", letterSpacing: "-0.035em", whiteSpace: "pre-line" }}>
              {SECTIONS[1].heading}
            </h2>
            <div>
              {SECTIONS[1].specs.map(sp => (
                <div key={sp.k} className="v9-spec-row">
                  <span className="text-[8px] tracking-[0.2em] text-white/22">{sp.k}</span>
                  <span className="text-[11px] font-semibold text-white/55">{sp.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Text block 2: LEFT position (section 3), image back on left ── */}
          <div
            className="v9-t2 absolute top-1/2 -translate-y-1/2 z-10"
            style={{
              right: "5vw",
              width: "clamp(240px, 36vw, 440px)",
              opacity: 0,
              transform: "translateY(-50%) translateY(30px)",
            }}
          >
            <p className="text-[8px] tracking-[0.45em] text-white/20 mb-4">{SECTIONS[2].tag}</p>
            <h2 className="font-black text-white leading-none mb-6"
              style={{ fontSize: "clamp(40px, 6vw, 80px)", letterSpacing: "-0.035em", whiteSpace: "pre-line" }}>
              {SECTIONS[2].heading}
            </h2>
            <div>
              {SECTIONS[2].specs.map(sp => (
                <div key={sp.k} className="v9-spec-row">
                  <span className="text-[8px] tracking-[0.2em] text-white/22">{sp.k}</span>
                  <span className="text-[11px] font-semibold text-white/55">{sp.v}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ══ CTA SECTION ══ */}
        <section className="flex h-dvh flex-col items-center justify-center gap-8 text-center px-8"
          style={{ background: "#050402" }}>
          <p className="text-[8px] tracking-[0.45em] text-white/18">LEISURE AUDIO — EDGE</p>
          <h2 className="font-black text-white"
            style={{ fontSize: "clamp(52px, 10vw, 130px)", letterSpacing: "-0.038em", lineHeight: 0.88 }}>
            OWN<br />THE ROOM.
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <Link href="/product/edge"
              className="rounded-full bg-white px-12 py-4 text-[12px] font-black tracking-[0.18em] text-black transition hover:bg-[#fbed2b] hover:scale-105">
              BUY EDGE — {inr.format(product.price)}
            </Link>
            <Link href="/v8"
              className="rounded-full border border-white/12 px-8 py-4 text-[11px] tracking-[0.12em] text-white/30 transition hover:border-white/35 hover:text-white/65">
              ALL PRODUCTS →
            </Link>
          </div>
          <p className="text-[8px] tracking-[0.12em] text-white/15 mt-2">FREE SHIPPING · 1 YEAR WARRANTY · MADE IN INDIA</p>
        </section>

      </div>
    </>
  );
}
