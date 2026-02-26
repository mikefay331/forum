import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ThreadList from "@/components/forum/ThreadList";
import type { ThreadWithDetails } from "@/lib/types/database";
import { THREADS_PER_PAGE } from "@/lib/constants";
import Button from "@/components/ui/Button";
import { Plus } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .single();
  const cat = data as { name: string; description: string | null } | null;
  return {
    title: cat?.name ?? "Category",
    description: cat?.description ?? undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort = "latest", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page));
  const supabase = await createClient();

  const { data: categoryData } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!categoryData) notFound();
  const category = categoryData as import("@/lib/types/database").Category;

  const offset = (currentPage - 1) * THREADS_PER_PAGE;

  let query = supabase
    .from("threads")
    .select(
      "*, author:profiles(id, username, display_name, avatar_url, role), category:categories(*)",
      { count: "exact" }
    )
    .eq("category_id", category.id);

  // Pinned threads first, then sort
  if (sort === "popular") {
    query = query.order("view_count", { ascending: false });
  } else if (sort === "unanswered") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
  }

  query = query.range(offset, offset + THREADS_PER_PAGE - 1);

  const { data: threads, count } = await query;

  // Add post counts
  const threadsWithCounts: ThreadWithDetails[] = await Promise.all(
    (threads ?? []).map(async (thread) => {
      const { count: postCount } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("thread_id", thread.id);
      return { ...thread, post_count: postCount ?? 0 } as ThreadWithDetails;
    })
  );

  const { data: session } = await supabase.auth.getSession();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: `${category.color ?? "#6366f1"}20` }}
          >
            {category.icon ?? "💬"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {category.description}
              </p>
            )}
          </div>
        </div>
        {session.session && (
          <Link href={`/thread/new?category=${category.id}`}>
            <Button size="sm">
              <Plus className="w-4 h-4" /> New Thread
            </Button>
          </Link>
        )}
      </div>

      <ThreadList
        threads={threadsWithCounts}
        totalCount={count ?? 0}
        currentPage={currentPage}
      />
    </div>
  );
}
