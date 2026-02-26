import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import ReactionButton from "./ReactionButton";
import { formatRelativeTime } from "@/lib/utils";
import type { PostWithDetails } from "@/lib/types/database";
import { Edit2 } from "lucide-react";
import Link from "next/link";

interface PostCardProps {
  post: PostWithDetails;
  currentUserId?: string;
}

export default function PostCard({ post, currentUserId: _currentUserId }: PostCardProps) {
  return (
    <div id={`post-${post.id}`} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex gap-4">
        {/* Author sidebar */}
        <div className="flex flex-col items-center gap-2 shrink-0 w-12">
          <Link href={`/profile/${post.author?.username}`}>
            <Avatar
              src={post.author?.avatar_url}
              alt={post.author?.display_name ?? post.author?.username ?? "User"}
              size="md"
            />
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Link
              href={`/profile/${post.author?.username}`}
              className="font-semibold text-sm text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {post.author?.display_name ?? post.author?.username}
            </Link>
            <Badge role={post.author?.role} />
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatRelativeTime(post.created_at)}
            </span>
            {post.is_edited && (
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Edit2 className="w-3 h-3" /> edited
              </span>
            )}
          </div>

          <MarkdownRenderer content={post.content} />

          {/* Reactions */}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <ReactionButton
              postId={post.id}
              reactionCount={post.reaction_count ?? 0}
              userReacted={post.user_reacted ?? false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
