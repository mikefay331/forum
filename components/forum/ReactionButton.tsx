"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface ReactionButtonProps {
  postId?: string;
  threadId?: string;
  reactionCount: number;
  userReacted: boolean;
}

export default function ReactionButton({
  postId,
  threadId,
  reactionCount,
  userReacted: initialReacted,
}: ReactionButtonProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [count, setCount] = useState(reactionCount);
  const [reacted, setReacted] = useState(initialReacted);
  const [loading, setLoading] = useState(false);

  const handleReact = async () => {
    if (!user) {
      showToast("Please sign in to react", "info");
      return;
    }
    if (loading) return;
    setLoading(true);

    if (reacted) {
      // Remove reaction
      let deleteQuery = supabase.from("reactions").delete().eq("user_id", user.id);
      if (postId) deleteQuery = deleteQuery.eq("post_id", postId);
      else if (threadId) deleteQuery = deleteQuery.eq("thread_id", threadId);

      const { error } = await deleteQuery;
      if (!error) {
        setReacted(false);
        setCount((c) => c - 1);
      }
    } else {
      const { error } = await supabase.from("reactions").insert({
        user_id: user.id,
        post_id: postId ?? null,
        thread_id: threadId ?? null,
        type: "like",
      });
      if (!error) {
        setReacted(true);
        setCount((c) => c + 1);
      }
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleReact}
      disabled={loading}
      className={cn(
        "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all",
        reacted
          ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400"
          : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400"
      )}
      aria-label={reacted ? "Remove like" : "Like"}
    >
      <ThumbsUp className="w-3.5 h-3.5" />
      <span>{count}</span>
    </button>
  );
}
