import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold"
          >
            <MessageSquare className="w-5 h-5" />
            {APP_NAME}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} {APP_NAME}. A community discussion
            platform.
          </p>
          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Home
            </Link>
            <Link href="/search" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Search
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
