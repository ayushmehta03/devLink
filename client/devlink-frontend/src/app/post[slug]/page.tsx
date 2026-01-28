"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api";
import { FiArrowLeft, FiShare2 } from "react-icons/fi";

/* ================= TYPES ================= */

type Author = {
  id?: string;
  username?: string;
  profile_image?: string;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url?: string;
  tags?: string[];
  created_at: string;
  view_count: number;
  author?: Author;
};

/* ================= HELPERS ================= */

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getReadTime = (content: string) =>
  `${Math.max(1, Math.ceil(content.split(" ").length / 200))} min read`;

/* ================= PAGE ================= */

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        const res = await apiFetch(`/posts/${slug}`);
        const data = res?.data ?? res;

        // 🔥 FORCE AUTHOR DEFAULTS (NO CONDITIONAL RENDERING)
        setPost({
          ...data,
          author: data.author ?? {
            username: "author",
            profile_image: "",
          },
        });
      } catch (err) {
        console.error(err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        Loading…
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
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
    <main
      className="min-h-screen bg-[#020617]"
      style={{
        color: "#ffffff",
        fontSize: "16px",
        lineHeight: "1.6",
      }}
    >
      {/* HEADER */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "#020617",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between">
          <button
            onClick={() => router.back()}
            style={{ color: "#60a5fa", fontSize: "14px" }}
          >
            <FiArrowLeft /> Back
          </button>

          <button
            onClick={handleShare}
            style={{ color: "#60a5fa", fontSize: "14px" }}
          >
            <FiShare2 /> Share
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <article
          style={{
            fontSize: "16px",
            lineHeight: "1.6",
            color: "#ffffff",
          }}
        >
          {/* IMAGE */}
          {post.image_url && (
            <div className="mb-10 rounded-xl overflow-hidden">
              <div className="relative w-full h-[220px] sm:h-[400px]">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* TITLE */}
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            {post.title}
          </h1>

          {/* META */}
          <div
            style={{
              fontSize: "14px",
              color: "#94a3b8",
              marginBottom: "20px",
            }}
          >
            {formatDate(post.created_at)} • {getReadTime(post.content)} •{" "}
            {post.view_count} views
          </div>

          {/* 🔥 AUTHOR (FORCED VISIBLE – NO TAILWIND) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "32px",
              padding: "12px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
            }}
          >
            <img
              src={
                post.author?.profile_image ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.username}`
              }
              alt="author"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
              }}
            />

            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                @{post.author?.username}
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                Author
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div
            style={{
              fontSize: "18px",
              color: "#e5e7eb",
              whiteSpace: "pre-line",
            }}
          >
            {post.content}
          </div>

          {/* TAGS */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "12px",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    background: "rgba(59,130,246,0.15)",
                    color: "#60a5fa",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* AUTHOR FOOTER */}
          <div
            style={{
              marginTop: "48px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <img
              src={
                post.author?.profile_image ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.username}`
              }
              alt="author"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
              }}
            />
            <div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                Written by
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                @{post.author?.username}
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
