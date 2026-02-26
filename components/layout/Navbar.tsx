"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  Search,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/components/ui/Toast";
import Avatar from "@/components/ui/Avatar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Button from "@/components/ui/Button";
import { APP_NAME } from "@/lib/constants";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    showToast("Signed out successfully", "success");
    router.push("/");
    router.refresh();
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl shrink-0"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="hidden sm:block">{APP_NAME}</span>
          </Link>

          {/* Search - desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="User menu"
                  aria-expanded={dropdownOpen}
                >
                  <Avatar
                    src={profile?.avatar_url}
                    alt={profile?.display_name ?? profile?.username ?? "User"}
                    size="sm"
                  />
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {profile?.display_name ?? profile?.username}
                  </span>
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1 overflow-hidden">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile?.display_name ?? profile?.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          @{profile?.username}
                        </p>
                      </div>
                      <Link
                        href={`/profile/${profile?.username}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-4 h-4" /> Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">
                    <UserPlus className="w-4 h-4" /> Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </form>
            {!user && (
              <div className="flex gap-2">
                <Link href="/auth/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
