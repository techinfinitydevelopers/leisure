"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Blog = {
  id: number;
  slug: string;
  title: string;
  coverImage: string;
  author: string;
  published: boolean;
  createdAt: string;
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  function load() {
    fetch("/api/admin/blogs")
      .then((r) => r.json())
      .then((data) => { setBlogs(Array.isArray(data) ? data : []); setLoading(false); });
  }
  useEffect(load, []);

  async function togglePublish(b: Blog) {
    setBusy(b.id);
    await fetch(`/api/admin/blogs/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !b.published }),
    });
    setBusy(null);
    load();
  }

  async function remove(b: Blog) {
    if (!confirm(`Delete "${b.title}"?`)) return;
    setBusy(b.id);
    await fetch(`/api/admin/blogs/${b.id}`, { method: "DELETE" });
    setBusy(null);
    load();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-offwhite">Blogs</h1>
          <p className="mt-1 text-sm text-offwhite/50">
            {loading ? "Loading…" : `${blogs.length} post${blogs.length === 1 ? "" : "s"}. Published posts appear on /blog.`}
          </p>
        </div>
        <Link href="/dashboard/blogs/new" className="btn-gold shrink-0">
          + New Blog
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {!loading && blogs.length === 0 && (
          <p className="text-sm text-offwhite/40">No posts yet. Click “New Blog” to write your first.</p>
        )}
        {blogs.map((b) => (
          <div key={b.id} className="glass flex items-center gap-4 rounded-xl p-4">
            <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
              {b.coverImage ? (
                <Image src={b.coverImage} alt="" width={80} height={56} className="h-14 w-20 object-cover" />
              ) : (
                <span className="text-[10px] text-offwhite/30">—</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-offwhite">{b.title}</p>
              <p className="truncate text-xs text-offwhite/40">
                /{b.slug} · {b.author} · {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide ${b.published ? "border border-green-400/40 text-green-300" : "border border-white/15 text-offwhite/40"}`}>
              {b.published ? "Live" : "Draft"}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => togglePublish(b)} disabled={busy === b.id}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs uppercase tracking-wide text-offwhite/70 hover:border-gold hover:text-gold disabled:opacity-50">
                {b.published ? "Unpublish" : "Publish"}
              </button>
              <Link href={`/dashboard/blogs/${b.id}/edit`}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs uppercase tracking-wide text-offwhite/70 hover:border-gold hover:text-gold">
                Edit
              </Link>
              <button type="button" onClick={() => remove(b)} disabled={busy === b.id}
                className="rounded-full border border-red-400/40 px-3 py-1.5 text-xs uppercase tracking-wide text-red-300 hover:border-red-400 disabled:opacity-50">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
