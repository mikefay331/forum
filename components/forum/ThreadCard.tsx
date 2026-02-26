import Link from "next/link";
import { MessageSquare, Eye, Pin, Lock, Clock } from "lucide-react";
import type { ThreadWithDetails } from "@/lib/types/database";
import { formatRelativeTime } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";

interface ThreadCardProps {
  thread: ThreadWithDetails;
  showCategory?: boolean;
}

export default function ThreadCard({
  thread,
  showCategory = false,
}: ThreadCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start gap-3">
        <Avatar
          src={thread.author?.avatar_url}
          alt={thread.author?.display_name ?? thread.author?.username ?? "User"}
          size="sm"
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start gap-2 flex-wrap mb-1">
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
            {showCategory && thread.category && (
              <Badge
                variant="category"
                color={thread.category.color ?? undefined}
              >
                {thread.category.icon} {thread.category.name}
              </Badge>
            )}
          </div>

          <Link
            href={`/thread/${thread.slug}`}
            className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 text-sm sm:text-base"
          >
            {thread.title}
          </Link>

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {thread.author?.display_name ?? thread.author?.username}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(thread.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {(thread.post_count ?? 0).toLocaleString()} replies
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {thread.view_count.toLocaleString()} views
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
