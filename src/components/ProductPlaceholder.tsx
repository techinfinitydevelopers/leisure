import Image from "next/image";

type ProductPlaceholderProps = {
  slug: string;
  model: string;
  imageUrl?: string;
  className?: string;
  priority?: boolean;
};

/**
 * Product image on a branded velvet→black gradient panel. The product renders
 * have black backgrounds, so they blend seamlessly into the panel.
 */
export default function ProductPlaceholder({
  slug,
  model,
  imageUrl,
  className = "",
  priority = false,
}: ProductPlaceholderProps) {
  const src = imageUrl && imageUrl.length > 0 ? imageUrl : `/products/${slug}.png`;
  return (
    <div
      className={`relative isolate flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border border-offwhite/10 bg-gradient-to-br from-velvet via-nearblack to-deepblack gold-glow ${className}`}
    >
      {/* Soft gold radial accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[120%] w-[120%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(251,237,43,0.16),transparent_60%)]"
      />

      {/* Product image */}
      <Image
        src={src}
        alt={`Leisure ${model}`}
        fill
        sizes="(max-width: 768px) 90vw, 50vw"
        priority={priority}
        className="object-contain p-6 sm:p-10"
      />
    </div>
  );
}
