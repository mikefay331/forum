import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ThreadDetail from "@/components/forum/ThreadDetail";
import type { PostWithDetails, ThreadWithDetails } from "@/lib/types/database";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("threads")
    .select("title, content")
    .eq("slug", slug)
    .single();
  return {
    title: data?.title ?? "Thread",
    description: data?.content?.slice(0, 160),
  };
}

export default async function ThreadPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: thread } = await supabase
    .from("threads")
    .select("*, author:profiles(id, username, display_name, avatar_url, role), category:categories(*)")
    .eq("slug", slug)
    .single();

  if (!thread) notFound();

  // Increment view count
  await supabase.rpc("increment_view_count", { thread_id: thread.id });

  const { data: posts } = await supabase
    .from("posts")
    .select("*, author:profiles(id, username, display_name, avatar_url, role)")
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true });

  const { data: { session } } = await supabase.auth.getSession();

  // Get reaction counts for posts
  const postsWithReactions: PostWithDetails[] = await Promise.all(
    (posts ?? []).map(async (post) => {
      const [reactionCount, userReaction] = await Promise.all([
        supabase
          .from("reactions")
          .select("id", { count: "exact", head: true })
          .eq("post_id", post.id),
        session?.user
          ? supabase
              .from("reactions")
              .select("id")
              .eq("post_id", post.id)
              .eq("user_id", session.user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      return {
        ...post,
        reaction_count: reactionCount.count ?? 0,
        user_reacted: !!userReaction.data,
      } as PostWithDetails;
    })
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href={`/category/${(thread as ThreadWithDetails).category?.slug}`}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {(thread as ThreadWithDetails).category?.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
          {thread.title}
        </span>
      </nav>

      <ThreadDetail
        thread={thread as ThreadWithDetails}
        posts={postsWithReactions}
        currentUserId={session?.user?.id}
      />
    </div>
  );
}
