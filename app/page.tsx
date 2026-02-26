import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CategoryList from "@/components/forum/CategoryList";
import Sidebar from "@/components/layout/Sidebar";
import Shoutbox from "@/components/forum/Shoutbox";
import AdvertisementBanner from "@/components/forum/AdvertisementBanner";
import type { CategoryWithStats, Advertisement } from "@/lib/types/database";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} — Where Degens Talk`,
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

  // Fetch advertisements (handle missing table gracefully)
  let advertisements: Advertisement[] = [];
  try {
    const { data } = await supabase
      .from("advertisements")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    advertisements = (data ?? []) as Advertisement[];
  } catch {
    advertisements = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Advertisement Banner */}
      <AdvertisementBanner advertisements={advertisements} />

      {/* Main content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Shoutbox */}
          <Shoutbox />
          {/* Categories */}
          <CategoryList categories={categoriesWithStats} />
        </div>
        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
