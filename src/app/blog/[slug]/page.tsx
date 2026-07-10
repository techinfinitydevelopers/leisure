import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogBySlug } from "@/lib/blogs";

export const dynamic = "force-dynamic";

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: "Leisure — Post not found" };
  return { title: `${blog.title} — Leisure`, description: blog.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();

  const content = blog.content ?? "";
  const hasHtml = /<[a-z][\s\S]*>/i.test(content);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <Link href="/blog" className="text-sm text-offwhite/50 transition-colors hover:text-gold">
        ← All posts
      </Link>

      <header className="mt-8">
        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-offwhite/40">
          {blog.author} · {fmtDate(blog.createdAt)}
        </p>
        <h1 className="mt-3 font-display text-4xl font-black leading-tight tracking-tight text-offwhite sm:text-5xl">
          {blog.title}
        </h1>
        {blog.excerpt && (
          <p className="mt-4 text-lg leading-relaxed text-offwhite/60">{blog.excerpt}</p>
        )}
      </header>

      {blog.coverImage && (
        <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <Image src={blog.coverImage} alt={blog.title} fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" />
        </div>
      )}

      {content.trim() ? (
        hasHtml ? (
          <article
            className="blog-content mt-10 text-[1.05rem] leading-relaxed text-offwhite/80"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <article className="blog-content mt-10 flex flex-col gap-5 text-[1.05rem] leading-relaxed text-offwhite/80">
            {content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p, i) => (
              <p key={i} className="whitespace-pre-line">{p}</p>
            ))}
          </article>
        )
      ) : (
        <p className="mt-10 text-offwhite/40">No content.</p>
      )}

      <div className="mt-16 border-t border-white/10 pt-8">
        <Link href="/blog" className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">
          ← Back to the Journal
        </Link>
      </div>
    </main>
  );
}
