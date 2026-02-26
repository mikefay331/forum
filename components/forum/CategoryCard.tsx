import Link from "next/link";
import { Clock } from "lucide-react";
import type { CategoryWithStats } from "@/lib/types/database";
import { formatRelativeTime } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

interface CategoryCardProps {
  category: CategoryWithStats;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <tr className="border-b border-gray-700/50 hover:bg-white/5 transition-colors">
      {/* Category info */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: `${category.color ?? "#2a9d8f"}25` }}
          >
            {category.icon ?? "💬"}
          </div>
          <div>
            <Link
              href={`/category/${category.slug}`}
              className="font-semibold text-white hover:text-teal-400 transition-colors text-sm"
            >
              {category.name}
            </Link>
            {category.description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </td>
      {/* Thread count */}
      <td className="py-3 px-4 text-center">
        <span className="text-sm text-gray-300 font-medium">
          {(category.thread_count ?? 0).toLocaleString()}
        </span>
        <p className="text-xs text-gray-500">threads</p>
      </td>
      {/* Last post */}
      <td className="py-3 px-4 hidden sm:table-cell">
        {category.latest_thread ? (
          <div className="flex items-center gap-2">
            <Avatar
              src={category.latest_thread.author?.avatar_url}
              alt={category.latest_thread.author?.username ?? ""}
              size="xs"
            />
            <div className="min-w-0">
              <Link
                href={`/thread/${category.latest_thread.slug}`}
                className="text-xs text-gray-300 hover:text-teal-400 truncate block max-w-[140px] transition-colors"
              >
                {category.latest_thread.title}
              </Link>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-2.5 h-2.5" />
                {formatRelativeTime(category.latest_thread.created_at)}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-500">No posts yet</span>
        )}
      </td>
    </tr>
  );
}
