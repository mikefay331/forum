"use client";

import { useCallback, useEffect, useState } from "react";
import PostCard from "./PostCard";
import ReplyForm from "./ReplyForm";
import { useRealtime } from "@/hooks/useRealtime";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/components/ui/Toast";
import type { PostWithDetails } from "@/lib/types/database";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { MessageSquare } from "lucide-react";

interface PostListProps {
  threadId: string;
  isLocked: boolean;
  initialPosts: PostWithDetails[];
  currentUserId?: string;
}

export default function PostList({
  threadId,
  isLocked,
  initialPosts,
  currentUserId,
}: PostListProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [posts, setPosts] = useState<PostWithDetails[]>(initialPosts);
  const [loading, setLoading] = useState(false);

  const fetchPost = useCallback(
    async (postId: string) => {
      const { data } = await supabase
        .from("posts")
        .select(
          `*, author:profiles(id, username, display_name, avatar_url, role)`
        )
        .eq("id", postId)
        .single();

      if (data) {
        const post = data as PostWithDetails;
        setPosts((prev) => {
          if (prev.some((p) => p.id === post.id)) return prev;
          return [...prev, post];
        });
        if (post.author?.username !== user?.email?.split("@")[0]) {
          showToast(
            `New reply from ${post.author?.display_name ?? post.author?.username ?? "someone"}`,
            "info"
          );
        }
      }
    },
    [supabase, user]
  );

  useRealtime({
    table: "posts",
    filter: `thread_id=eq.${threadId}`,
    onInsert: (payload) => {
      fetchPost((payload as { id: string }).id);
    },
  });

  const handleReplyAdded = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select(`*, author:profiles(id, username, display_name, avatar_url, role)`)
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    if (data) setPosts(data as PostWithDetails[]);
    setLoading(false);
  }, [supabase, threadId]);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  return (
    <div className="space-y-4">
      {posts.length === 0 && !loading ? (
        <EmptyState
          title="No replies yet"
          description="Be the first to reply to this thread!"
          icon={<MessageSquare className="w-12 h-12" />}
        />
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={currentUserId} />
        ))
      )}

      {loading && <LoadingSpinner className="py-4" />}

      {/* Reply form */}
      {!isLocked && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Leave a Reply
          </h3>
          <ReplyForm threadId={threadId} onReplyAdded={handleReplyAdded} />
        </div>
      )}

      {isLocked && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-center">
          <p className="text-yellow-700 dark:text-yellow-400 text-sm font-medium">
            🔒 This thread is locked. No new replies can be posted.
          </p>
        </div>
      )}
    </div>
  );
}
