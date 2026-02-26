import Link from "next/link";
import { Eye, Clock, Pin, Lock } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import PostList from "./PostList";
import type { ThreadWithDetails, PostWithDetails } from "@/lib/types/database";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface ThreadDetailProps {
  thread: ThreadWithDetails;
  posts: PostWithDetails[];
  currentUserId?: string;
}

export default function ThreadDetail({
  thread,
  posts,
  currentUserId,
}: ThreadDetailProps) {
  return (
    <div className="space-y-6">
      {/* Thread header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Link
            href={`/category/${thread.category?.slug}`}
            className="inline-flex"
          >
            <Badge
              variant="category"
              color={thread.category?.color ?? undefined}
            >
              {thread.category?.icon} {thread.category?.name}
            </Badge>
          </Link>
          {thread.is_pinned && (
            <Badge variant="pinned" className="flex items-center gap-1">
              <Pin className="w-2.5 h-2.5" /> Pinned
            </Badge>
          )}
          {thread.is_locked && (
            <Badge variant="locked" className="flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Locked
            </Badge>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {thread.title}
        </h1>

        <div className="flex items-center gap-3 mb-5">
          <Link href={`/profile/${thread.author?.username}`}>
            <Avatar
              src={thread.author?.avatar_url}
              alt={thread.author?.display_name ?? thread.author?.username ?? "User"}
              size="sm"
            />
          </Link>
          <div>
            <Link
              href={`/profile/${thread.author?.username}`}
              className="text-sm font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {thread.author?.display_name ?? thread.author?.username}
            </Link>
            <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(thread.created_at)} ({formatRelativeTime(thread.created_at)})
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {thread.view_count.toLocaleString()} views
              </span>
            </div>
          </div>
        </div>

        <MarkdownRenderer content={thread.content} />
      </div>

      {/* Replies */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {posts.length} {posts.length === 1 ? "Reply" : "Replies"}
        </h2>
        <PostList
          threadId={thread.id}
          isLocked={thread.is_locked}
          initialPosts={posts}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
