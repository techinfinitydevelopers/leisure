"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import RichTextEditor from "./RichTextEditor";

type BlogInitial = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  published: boolean;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-offwhite outline-none focus:border-gold";
const labelClass =
  "mb-1 block text-xs uppercase tracking-wide text-offwhite/60";

function slugify(v: string) {
  return v.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
}

export default function BlogForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: BlogInitial;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) setCoverImage(data.url);
      else setError(data.error ?? "Upload failed");
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    try {
      const payload = { title, slug, author, excerpt, content, coverImage, published };
      const res = await fetch(
        mode === "edit" ? `/api/admin/blogs/${initial?.id}` : "/api/admin/blogs",
        {
          method: mode === "edit" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (res.ok) {
        router.push("/dashboard/blogs");
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save blog.");
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-offwhite">
          {mode === "edit" ? "Edit Post" : "New Post"}
        </h1>
      </div>

      {error && (
        <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>
      )}

      <section className="glass flex flex-col gap-4 rounded-2xl p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input
              value={slug}
              onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
              className={inputClass}
            />
          </div>
          <div className="lg:col-span-2">
            <label className={labelClass}>Author</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Leisure" className={inputClass} />
          </div>
          <div className="lg:col-span-2">
            <label className={labelClass}>Excerpt (short summary)</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={inputClass} />
          </div>
          <div className="lg:col-span-2">
            <label className={labelClass}>Content</label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </div>

        {/* Cover image */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-24 w-40 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
            {coverImage ? (
              <Image src={coverImage} alt="Cover" width={160} height={96} className="h-24 w-40 object-cover" />
            ) : (
              <span className="text-xs text-offwhite/40">No cover</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="btn-outline cursor-pointer px-4 py-2 text-xs">
              {uploading ? "Uploading…" : "Cover Image"}
              <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
            </label>
            {coverImage && (
              <button type="button" onClick={() => setCoverImage("")} className="text-xs uppercase tracking-wide text-offwhite/50 hover:text-red-300">Clear</button>
            )}
          </div>
          <label className="ml-auto flex items-center gap-2 text-sm text-offwhite/70">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published
          </label>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving || uploading} className="btn-gold disabled:opacity-60">
          {saving ? "Saving…" : mode === "edit" ? "Save Changes" : "Create Post"}
        </button>
        <button type="button" onClick={() => router.push("/dashboard/blogs")} className="btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}
