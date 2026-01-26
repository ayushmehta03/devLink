"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

type Post = {
  id: string;
  title: string;
  slug?: string;
  content: string;
  tags?: string[];
  image_url?: string;
  view_count: number;
  created_at: string;
};

const getExcerpt = (content: string, len = 140) =>
  content.length > len ? content.slice(0, len) + "…" : content;

const getReadTime = (content: string) =>
  `${Math.max(1, Math.ceil(content.split(" ").length / 200))} min read`;

function PostSkeleton() {
  return (
    <div className="rounded-2xl bg-[#020617] border border-white/5 animate-pulse overflow-hidden">
      <div className="aspect-video bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-24 bg-white/10 rounded" />
        <div className="h-4 w-3/4 bg-white/10 rounded" />
        <div className="h-3 w-full bg-white/10 rounded" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHome();
  }, []);

  const fetchHome = async () => {
    try {
      const res = await apiFetch("/home");
      setPosts(res?.posts || []);
    } catch (err) {
      console.error("HOME FEED ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const isSinglePost = posts.length === 1;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <header className="sticky top-0 z-50 backdrop-blur bg-[#020617]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-lg font-bold tracking-tight">
            <span className="text-blue-400">Dev</span>Link
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 rounded-lg text-sm hover:bg-white/5 transition"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/register")}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 transition"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-2 gap-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1600&auto=format&fit=crop"
              alt="Developer coding on MacBook"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/45" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            A calmer place for developers to{" "}
            <span className="text-blue-400">think & share</span>
          </h1>

          <p className="text-slate-400 max-w-xl text-lg">
            Write blogs, share ideas, and connect with developers —
            without noise.
          </p>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => router.push("/register")}
              className="px-8 py-4 rounded-xl bg-blue-600 font-semibold hover:bg-blue-500 transition"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition"
            >
              Sign In
            </button>
          </div>
        </motion.div>

        <div>
          <h2 className="text-2xl font-semibold mb-6 text-slate-200">
            Trending
          </h2>

          <div
            className={
              isSinglePost
                ? "flex justify-center"
                : "grid grid-cols-1 sm:grid-cols-2 gap-6"
            }
          >
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))}

            {!loading && posts.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-bold mb-2">
                  No posts yet
                </h3>
                <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                  Be the first to publish on DevLink.
                </p>
                <button
                  onClick={() => router.push("/register")}
                  className="px-6 py-3 rounded-xl bg-blue-600 font-semibold hover:bg-blue-500 transition"
                >
                  Create first post
                </button>
              </div>
            )}

            {!loading &&
              posts.map((post, i) => {
                const hasImage =
                  post.image_url &&
                  post.image_url.startsWith("http");

                const postUrl = `/post/${post.slug || post.id}`;

                return (
                  <div
                    key={post.id}
                    className={isSinglePost ? "w-full max-w-lg" : ""}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => router.push(postUrl)}
                      className="
                        group cursor-pointer rounded-2xl overflow-hidden
                        bg-[#020617]
                        border border-white/5
                        hover:border-blue-500/30
                        transition
                      "
                    >
                      {hasImage && (
                        <div className="relative aspect-video">
                          <Image
                            src={post.image_url!}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="p-4 space-y-2">
                        <div className="text-xs text-slate-500">
                          {getReadTime(post.content)} •{" "}
                          {post.view_count} views
                        </div>

                        <h3
                          className={`font-semibold leading-snug line-clamp-2 ${
                            hasImage ? "text-lg" : "text-xl"
                          }`}
                        >
                          {post.title}
                        </h3>

                        <p className="text-slate-400 text-sm line-clamp-2">
                          {getExcerpt(post.content)}
                        </p>

                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(postUrl);
                          }}
                          className="inline-block text-sm font-medium text-blue-400 hover:text-blue-300 transition"
                        >
                          Read more →
                        </span>

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-2 flex-wrap pt-1">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs text-blue-400/80"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
    </main>
  );
}
