import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewThreadForm from "@/components/forum/NewThreadForm";
import type { Category } from "@/lib/types/database";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export const metadata: Metadata = { title: "New Thread" };

export default async function NewThreadPage({ searchParams }: Props) {
  const { category: defaultCategoryId } = await searchParams;
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Create New Thread
      </h1>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <NewThreadForm
          categories={(categories ?? []) as Category[]}
          defaultCategoryId={defaultCategoryId}
        />
      </div>
    </div>
  );
}
