import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { MessageSquare, TrendingUp, Users } from "lucide-react";

export default async function Sidebar() {
  const supabase = await createClient();

  const [threadCount, postCount, recentActivity] = await Promise.all([
    supabase.from("threads").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase
      .from("threads")
      .select("id, title, slug, created_at, author:profiles(username)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    {
      label: "Total Threads",
      value: threadCount.count ?? 0,
      icon: MessageSquare,
    },
    { label: "Total Replies", value: postCount.count ?? 0, icon: TrendingUp },
  ];

  return (
    <aside className="space-y-6">
      {/* Forum stats */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" />
          Forum Stats
        </h3>
        <div className="space-y-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <stat.icon className="w-3.5 h-3.5" />
                {stat.label}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {stat.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.data?.length === 0 ? (
            <p className="text-sm text-gray-400">No recent activity</p>
          ) : (
            recentActivity.data?.map((thread) => (
              <div key={thread.id}>
                <Link
                  href={`/thread/${thread.slug}`}
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 leading-snug transition-colors"
                >
                  {thread.title}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  by {(thread.author as any)?.username ?? "Unknown"} ·{" "}
                  {formatRelativeTime(thread.created_at)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
