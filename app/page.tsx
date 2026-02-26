import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CategoryList from "@/components/forum/CategoryList";
import Sidebar from "@/components/layout/Sidebar";
import type { CategoryWithStats } from "@/lib/types/database";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: `${APP_NAME} — Community Forums`,
  description: APP_DESCRIPTION,
};

export default async function HomePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const categoriesWithStats: CategoryWithStats[] = await Promise.all(
    (categories ?? []).map(async (cat) => {
      const [threadCountResult, latestThreadResult] = await Promise.all([
        supabase
          .from("threads")
          .select("id", { count: "exact", head: true })
          .eq("category_id", cat.id),
        supabase
          .from("threads")
          .select("*, author:profiles(id, username, display_name, avatar_url, role), category:categories(*)")
          .eq("category_id", cat.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
      ]);

      return {
        ...cat,
        thread_count: threadCountResult.count ?? 0,
        latest_thread: latestThreadResult.data ?? undefined,
      } as CategoryWithStats;
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-3">
          <MessageSquare className="w-8 h-8" />
          <span className="text-3xl font-bold">{APP_NAME}</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {APP_DESCRIPTION}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            href="/thread/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Start a Discussion
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Categories
          </h2>
          <CategoryList categories={categoriesWithStats} />
        </div>
        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
