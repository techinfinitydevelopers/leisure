"use client";

import { useRef, useState, type RefObject, type MouseEvent } from "react";

type Props = {
  src: string;
  alt: string;
  imgRef: RefObject<HTMLImageElement | null>;
  /** How much the side panel magnifies the hovered region. */
  zoom?: number;
};

// Amazon/Myntra-style magnifier: a lens follows the cursor over the image,
// and a zoomed crop of whatever's under the lens shows in a panel beside it.
// Hover-only by nature — on touch devices the base image just stays as-is.
export default function ZoomImage({ src, alt, imgRef, zoom = 2.2 }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [bgPos, setBgPos] = useState({ x: 50, y: 50 });
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });

  const lensSizePct = 100 / zoom;
  const halfLens = lensSizePct / 2;

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const xPct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setBgPos({ x: xPct, y: yPct });
    setLensPos({
      x: Math.min(100 - lensSizePct, Math.max(0, xPct - halfLens)),
      y: Math.min(100 - lensSizePct, Math.max(0, yPct - halfLens)),
    });
  };

  return (
    <div
      ref={frameRef}
      className="zoom-frame"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onMouseMove={handleMove}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} className="hero__still" src={src} alt={alt} />
      {active && (
        <>
          <div
            className="zoom-lens"
            style={{
              left: `${lensPos.x}%`,
              top: `${lensPos.y}%`,
              width: `${lensSizePct}%`,
              height: `${lensSizePct}%`,
            }}
          />
          <div
            className="zoom-panel"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: `${zoom * 100}% ${zoom * 100}%`,
              backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
            }}
          />
        </>
      )}
    </div>
  );
}
