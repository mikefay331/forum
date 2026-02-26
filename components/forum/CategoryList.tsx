import CategoryCard from "./CategoryCard";
import type { CategoryWithStats } from "@/lib/types/database";
import EmptyState from "@/components/ui/EmptyState";
import { LayoutGrid } from "lucide-react";

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
