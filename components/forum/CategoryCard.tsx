import Link from "next/link";
import { MessageSquare, Clock } from "lucide-react";
import type { CategoryWithStats } from "@/lib/types/database";
import { formatRelativeTime } from "@/lib/utils";

interface CategoryCardProps {
  category: CategoryWithStats;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: `${category.color ?? "#6366f1"}20` }}
        >
          {category.icon ?? "💬"}
        </div>
        <div className="min-w-0">
          <h3
            className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate"
            style={{ color: undefined }}
          >
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{(category.thread_count ?? 0).toLocaleString()} threads</span>
        </div>
        {category.latest_thread && (
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(category.latest_thread.created_at)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
