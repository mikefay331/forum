"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ThreadCard from "./ThreadCard";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import type { ThreadWithDetails } from "@/lib/types/database";
import { THREAD_SORT_OPTIONS, THREADS_PER_PAGE } from "@/lib/constants";
import { MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThreadListProps {
  threads: ThreadWithDetails[];
  totalCount: number;
  currentPage: number;
  showCategory?: boolean;
}

export default function ThreadList({
  threads,
  totalCount,
  currentPage,
  showCategory = false,
}: ThreadListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sortBy = searchParams.get("sort") ?? "latest";
  const totalPages = Math.ceil(totalCount / THREADS_PER_PAGE);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key !== "page") params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Sort controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {THREAD_SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateParam("sort", opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              sortBy === opt.value
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Thread list */}
      {threads.length === 0 ? (
        <EmptyState
          title="No threads yet"
          description="Be the first to start a discussion!"
          icon={<MessageSquare className="w-16 h-16" />}
        />
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              showCategory={showCategory}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages} ({totalCount} threads)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => updateParam("page", String(currentPage - 1))}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => updateParam("page", String(currentPage + 1))}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
