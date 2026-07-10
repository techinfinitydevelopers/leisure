import { notFound } from "next/navigation";
import BlogForm from "@/components/dashboard/BlogForm";
import { getBlogById } from "@/lib/blogs";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blog = await getBlogById(Number(id));
  if (!blog) notFound();

  return (
    <BlogForm
      mode="edit"
      initial={{
        id: blog.id,
        slug: blog.slug,
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        coverImage: blog.coverImage,
        author: blog.author,
        published: blog.published,
      }}
    />
  );
}
