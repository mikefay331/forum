"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect } from "react";

interface SearchBarProps {
  defaultValue?: string;
}

export default function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const debouncedQuery = useDebounce(query, 500);
  const router = useRouter();

  useEffect(() => {
    if (debouncedQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
    }
  }, [debouncedQuery, router]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="search"
        placeholder="Search threads, posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
