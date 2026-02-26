import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminCategoryList from "@/components/admin/AdminCategoryList";
import { Tag } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin — Categories" };

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
  if (!me || me.role !== "admin") redirect("/");

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/admin" className="text-gray-400 hover:text-gray-200 text-sm">Admin</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-white">Categories</span>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <Tag className="w-6 h-6 text-teal-400" />
        <h1 className="text-xl font-bold text-white">Category Management</h1>
      </div>
      <AdminCategoryList categories={categories ?? []} />
    </div>
  );
}
