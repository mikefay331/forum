import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, MessageSquare, Shield, Megaphone, Tag } from "lucide-react";

export const metadata: Metadata = { title: "Admin Panel" };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
  if (!profile || profile.role !== "admin") redirect("/");

  const [userCount, threadCount, postCount] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("threads").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total Users", value: userCount.count ?? 0, icon: Users },
    { label: "Total Threads", value: threadCount.count ?? 0, icon: MessageSquare },
    { label: "Total Posts", value: postCount.count ?? 0, icon: MessageSquare },
  ];

  const adminLinks = [
    { href: "/admin/users", label: "User Management", desc: "Manage users, roles, and bans", icon: Users },
    { href: "/admin/categories", label: "Category Management", desc: "Add, edit, delete categories", icon: Tag },
    { href: "/admin/advertisements", label: "Advertisements", desc: "Manage banner advertisements", icon: Megaphone },
    { href: "/admin/announcements", label: "Announcements", desc: "Create announcement threads", icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-7 h-7 text-red-400" />
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl p-5 border border-gray-700/50" style={{ background: "#1e2537" }}>
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className="w-5 h-5 text-teal-400" />
              <span className="text-sm text-gray-400">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-start gap-4 p-5 rounded-xl border border-gray-700/50 hover:border-teal-500/50 transition-colors"
            style={{ background: "#1e2537" }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#2a9d8f20" }}>
              <link.icon className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="font-semibold text-white">{link.label}</p>
              <p className="text-sm text-gray-400 mt-0.5">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
