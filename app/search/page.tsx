import { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ThreadCard from "@/components/forum/ThreadCard";
import SearchBar from "@/components/forum/SearchBar";
import type { ThreadWithDetails } from "@/lib/types/database";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Search } from "lucide-react";

interface Props {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export const metadata: Metadata = { title: "Search" };

async function SearchResults({ query }: { query: string }) {
  if (!query.trim()) {
    return (
      <EmptyState
        title="Search for threads"
        description="Enter a search term above to find threads and discussions."
        icon={<Search className="w-16 h-16" />}
      />
    );
  }

  const supabase = await createClient();
  const { data: threads } = await supabase
    .from("threads")
    .select("*, author:profiles(id, username, display_name, avatar_url, role), category:categories(*)")
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(30);

  const threadsWithCounts: ThreadWithDetails[] = await Promise.all(
    (threads ?? []).map(async (thread) => {
      const { count } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("thread_id", thread.id);
      return { ...thread, post_count: count ?? 0 } as ThreadWithDetails;
    })
  );

  if (threadsWithCounts.length === 0) {
    return (
      <EmptyState
        title="No results found"
        description={`No threads found matching "${query}". Try different search terms.`}
        icon={<Search className="w-16 h-16" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {threadsWithCounts.length} results for &ldquo;{query}&rdquo;
      </p>
      {threadsWithCounts.map((thread) => (
        <ThreadCard key={thread.id} thread={thread} showCategory />
      ))}
    </div>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Search
        </h1>
        <SearchBar defaultValue={q} />
      </div>
      <Suspense fallback={<LoadingSpinner className="py-12" />}>
        <SearchResults query={q} />
      </Suspense>
    </div>
  );
}
