import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileCard from "@/components/profile/ProfileCard";
import ThreadCard from "@/components/forum/ThreadCard";
import PostCard from "@/components/forum/PostCard";
import type { ThreadWithDetails, PostWithDetails } from "@/lib/types/database";
import EmptyState from "@/components/ui/EmptyState";
import { MessageSquare } from "lucide-react";

interface Props {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { username } = await params;
  const { tab = "threads" } = await searchParams;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const [threadCountResult, postCountResult] = await Promise.all([
    supabase
      .from("threads")
      .select("id", { count: "exact", head: true })
      .eq("author_id", profile.id),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", profile.id),
  ]);

  let threads: ThreadWithDetails[] = [];
  let posts: PostWithDetails[] = [];

  if (tab === "threads") {
    const { data } = await supabase
      .from("threads")
      .select("*, author:profiles(id, username, display_name, avatar_url, role), category:categories(*)")
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);
    threads = (data ?? []) as ThreadWithDetails[];
  } else if (tab === "replies") {
    const { data } = await supabase
      .from("posts")
      .select("*, author:profiles(id, username, display_name, avatar_url, role)")
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);
    posts = (data ?? []) as PostWithDetails[];
  }

  const tabs = [
    { id: "threads", label: "Threads" },
    { id: "replies", label: "Replies" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <ProfileCard
        profile={profile}
        threadCount={threadCountResult.count ?? 0}
        postCount={postCountResult.count ?? 0}
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((t) => (
          <a
            key={t.id}
            href={`/profile/${username}?tab=${t.id}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {/* Content */}
      {tab === "threads" && (
        <div className="space-y-3">
          {threads.length === 0 ? (
            <EmptyState
              title="No threads yet"
              description="This user hasn't started any threads."
              icon={<MessageSquare className="w-12 h-12" />}
            />
          ) : (
            threads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} showCategory />
            ))
          )}
        </div>
      )}

      {tab === "replies" && (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <EmptyState
              title="No replies yet"
              description="This user hasn't made any replies."
              icon={<MessageSquare className="w-12 h-12" />}
            />
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
