import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getPublishedBlogs } from "@/lib/blogs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leisure — Journal",
  description: "Stories, guides and news from Leisure.",
};

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function BlogListPage() {
  const blogs = await getPublishedBlogs();

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8">
      <header className="mb-12">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">The Journal</span>
        <h1 className="mt-3 font-display text-5xl font-black tracking-tight text-offwhite sm:text-6xl">Blog</h1>
      </header>

      {blogs.length === 0 ? (
        <p className="text-offwhite/40">No posts yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b) => (
            <Link
              key={b.id}
              href={`/blog/${b.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] transition-colors hover:border-gold/40"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/5">
                {b.coverImage ? (
                  <Image
                    src={b.coverImage}
                    alt={b.title}
                    fill
                    sizes="(max-width:640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-offwhite/20">Leisure</div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <p className="text-[0.7rem] uppercase tracking-[0.14em] text-offwhite/40">
                  {b.author} · {fmtDate(b.createdAt)}
                </p>
                <h2 className="font-display text-xl font-bold text-offwhite transition-colors group-hover:text-gold">
                  {b.title}
                </h2>
                {b.excerpt && (
                  <p className="line-clamp-3 text-sm leading-relaxed text-offwhite/60">{b.excerpt}</p>
                )}
                <span className="mt-auto pt-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-gold">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
