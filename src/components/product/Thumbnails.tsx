"use client";

type ThumbnailsProps = {
  images?: string[];
  value?: number;
  onChange?: (i: number) => void;
};

export default function Thumbnails({ images = [], value = 0, onChange }: ThumbnailsProps) {
  if (!images.length) return null;
  return (
    <div className="hero__thumbs" role="group" aria-label="Product views">
      {images.map((src, i) => (
        <button
          key={src}
          type="button"
          aria-label={`View ${i + 1}`}
          aria-pressed={value === i}
          className={`hero__thumb ${value === i ? "is-active" : ""}`}
          onClick={() => onChange?.(i)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" loading="lazy" />
        </button>
      ))}
    </div>
  );
}
