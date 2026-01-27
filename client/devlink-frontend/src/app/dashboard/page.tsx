"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  FiBell,
  FiHome,
  FiMessageCircle,
  FiPlus,
  FiCompass,
  FiUser,
  FiEye,
  FiSearch,
  FiCode,
  FiLogOut,
} from "react-icons/fi";


type Author = {
  username: string;
  profile_image?: string;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url?: string;
  tags?: string[];
  view_count: number;
  author: Author;
};

type User = {
  id: string;
  username: string;
  profile_image?: string;
};


const formatViews = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString();

const excerpt = (t: string, l = 90) =>
  t.length > l ? t.slice(0, l) + "…" : t;


export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/auth/me")
      .then((u) => setUser(u))
      .catch(() => router.replace("/login"));
  }, [router]);

  useEffect(() => {
    apiFetch("/posts/trending")
      .then((res) => setPosts(res.posts || []))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#101922] flex items-center justify-center text-[#92adc9]">
        Loading dashboard…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#101922] flex justify-center">
      <div className="w-full max-w-6xl px-2 lg:px-6 pb-28">

        <div className="sticky top-0 z-50 bg-[#101922]/80 backdrop-blur">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white">
                <FiCode />
              </div>
              <div className="leading-tight">
                <p className="text-white font-semibold text-sm">DevLink</p>
                <div className="flex items-center gap-2 text-xs text-[#92adc9]">
                  <Image
                    src={
                      user.profile_image ||
                      "https://api.dicebear.com/7.x/identicon/svg?seed=user"
                    }
                    width={18}
                    height={18}
                    alt="user"
                    className="rounded-full"
                  />
                  @{user.username}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-slate-800">
                <FiBell />
              </button>
              <button
                onClick={logout}
                className="h-10 w-10 rounded-full flex items-center justify-center text-primary hover:bg-slate-800"
              >
                <FiLogOut />
              </button>
            </div>
          </div>

          {/* SEARCH */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 bg-[#233648] h-11 rounded-xl px-4">
              <FiSearch className="text-[#92adc9]" />
              <input
                placeholder="Search posts, developers, or tags"
                className="bg-transparent outline-none text-sm w-full text-white placeholder-[#92adc9]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-2">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-56 rounded-xl bg-[#192633] animate-pulse"
              />
            ))}

          {!loading &&
            posts.map((post) => (
              <div
                key={post.id}
                onClick={() => router.push(`/post/${post.slug}`)}
                className="cursor-pointer rounded-xl bg-[#192633] border border-slate-800 overflow-hidden hover:border-primary/40 transition"
              >
                {post.image_url && (
                  <div className="relative aspect-video">
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-4 space-y-2">
                  {post.tags && (
                    <div className="flex gap-2">
                      {post.tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs font-bold text-primary"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-lg font-bold text-white">
                    {post.title}
                  </p>

                  <p className="text-sm text-[#92adc9] line-clamp-2">
                    {excerpt(post.content)}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-[#92adc9]">
                    <div className="flex items-center gap-2">
                      <Image
                        src={
                          post.author.profile_image ||
                          "https://api.dicebear.com/7.x/identicon/svg?seed=author"
                        }
                        width={24}
                        height={24}
                        alt="author"
                        className="rounded-full"
                      />
                      @{post.author.username}
                    </div>

                    <div className="flex items-center gap-1">
                      <FiEye />
                      {formatViews(post.view_count)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* ================= BOTTOM NAV ================= */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#101922]/95 border-t border-slate-800 backdrop-blur px-6 pt-3 pb-8 flex justify-between max-w-6xl mx-auto">
          <Nav icon={<FiHome />} label="Feed" active />
          <Nav icon={<FiMessageCircle />} label="Chat" />
          <button className="-top-6 relative w-14 h-14 bg-primary rounded-full text-white flex items-center justify-center shadow-lg shadow-primary/30">
            <FiPlus size={28} />
          </button>
          <Nav icon={<FiCompass />} label="Discover" />
          <Nav icon={<FiUser />} label="Profile" />
        </div>
      </div>
    </main>
  );
}

/* ================= NAV ITEM ================= */

function Nav({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
        active ? "text-primary" : "text-slate-400"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}
