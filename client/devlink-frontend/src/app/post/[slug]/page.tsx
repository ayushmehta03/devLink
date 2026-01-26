"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api";

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  tags?: string[];
  image_url?: string;
  author_id: string;
  created_at: string;
  view_count: number;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const getReadTime = (content: string) =>
  `${Math.max(1, Math.ceil(content.split(" ").length / 200))} min read`;

const isValidImage = (url?: string) =>
  typeof url === "string" && url.trim().startsWith("http");

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [suggested, setSuggested] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        const postData = await apiFetch(`/posts/${slug}`);
        setPost(postData);

        const feed = await apiFetch("/home");

        const postsArray: Post[] = Array.isArray(feed)
          ? feed
          : Array.isArray(feed?.posts)
          ? feed.posts
          : [];

        setSuggested(
          postsArray.filter((p) => p.slug !== slug).slice(0, 3)
        );
      } catch (err) {
        console.error("Post page error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-400 flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-400 flex items-center justify-center">
        Post not found
      </div>
    );
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between">
          <button
            onClick={() => router.back()}
            className="text-blue-400 text-sm hover:text-blue-300 transition"
          >
            ← Back
          </button>
          <button
            onClick={handleShare}
            className="text-blue-400 text-sm hover:text-blue-300 transition"
          >
            Share
          </button>
        </div>
      </header>

      {/* Article */}
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-3xl mx-auto px-4 py-8"
      >
        {/* Hero Image */}
        {isValidImage(post.image_url) && (
          <div className="relative w-full h-[220px] sm:h-[360px] lg:h-[420px] rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.image_url!}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 768px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="text-sm text-slate-400 mb-6 flex gap-3 flex-wrap">
          <span>{formatDate(post.created_at)}</span>
          <span>•</span>
          <span>{getReadTime(post.content)}</span>
          <span>•</span>
          <span>{post.view_count} views</span>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <p className="text-slate-300 leading-relaxed text-base whitespace-pre-line">
          {post.content}
        </p>

        {/* Suggested Posts */}
        {suggested.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/5">
            <h3 className="text-xl font-semibold mb-6 text-slate-200">
              Suggested for you
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {suggested.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => router.push(`/post/${p.slug}`)}
                  className="cursor-pointer rounded-xl overflow-hidden bg-[#020617] border border-white/5 hover:border-blue-500/30 hover:-translate-y-1 transition-all"
                >
                  {isValidImage(p.image_url) && (
                    <div className="relative w-full h-[160px]">
                      <Image
                        src={p.image_url!}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <h4 className="font-semibold line-clamp-2">
                      {p.title}
                    </h4>
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {p.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.article>
    </main>
  );
}
