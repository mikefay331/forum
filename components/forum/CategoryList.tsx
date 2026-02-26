import CategoryCard from "./CategoryCard";
import type { CategoryWithStats } from "@/lib/types/database";
import EmptyState from "@/components/ui/EmptyState";
import { LayoutGrid, MessageSquare } from "lucide-react";
import Link from "next/link";

interface CategoryListProps {
  categories: CategoryWithStats[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <EmptyState
        title="No categories yet"
        description="Categories will appear here once they are created."
        icon={<LayoutGrid className="w-16 h-16" />}
      />
    );
  }

  // Group categories by category_group
  const groups: { [key: string]: CategoryWithStats[] } = {};
  const ungrouped: CategoryWithStats[] = [];

  for (const cat of categories) {
    if (cat.category_group) {
      if (!groups[cat.category_group]) groups[cat.category_group] = [];
      groups[cat.category_group].push(cat);
    } else {
      ungrouped.push(cat);
    }
  }

  const renderTable = (cats: CategoryWithStats[]) => (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-700/50">
          <th className="py-2 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Forum</th>
          <th className="py-2 px-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Threads</th>
          <th className="py-2 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Last Post</th>
        </tr>
      </thead>
      <tbody>
        {cats.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-4">
      {/* Show ungrouped categories */}
      {ungrouped.length > 0 && (
        <div className="rounded-lg overflow-hidden border border-gray-700/50" style={{ background: "#1e2537" }}>
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "#2a9d8f20", borderBottom: "1px solid #2a9d8f40" }}>
            <MessageSquare className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-semibold text-teal-300">PumpTalk Forums</span>
          </div>
          {renderTable(ungrouped)}
        </div>
      )}

      {/* Show grouped categories */}
      {Object.entries(groups).map(([groupName, cats]) => (
        <div key={groupName} className="rounded-lg overflow-hidden border border-gray-700/50" style={{ background: "#1e2537" }}>
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "#2a9d8f20", borderBottom: "1px solid #2a9d8f40" }}>
            <MessageSquare className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-semibold text-teal-300">{groupName}</span>
          </div>
          {renderTable(cats)}
        </div>
      ))}

      {/* New Thread button */}
      <div className="flex justify-end">
        <Link
          href="/thread/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white hover:opacity-90 transition-colors"
          style={{ background: "#2a9d8f" }}
        >
          Start a Discussion
        </Link>
      </div>
    </div>
  );
}
