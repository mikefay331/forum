"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  Search,
  MessageSquare,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/components/ui/Toast";
import Avatar from "@/components/ui/Avatar";

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
    <header className="sticky top-0 z-40 w-full border-b border-gray-700/50" style={{ background: "#141824" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Zap className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-lg text-white">PumpTalk</span>
          </Link>

          {/* Nav links - desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors">Home</Link>
            <Link href="/search" className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors">Search</Link>
            <Link href="/token" className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors">Token</Link>
          </nav>

          {/* Search - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded border border-gray-700 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500"
              style={{ background: "#1e2537" }}
            />
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/messages" className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>DMs</span>
                </Link>
                {profile?.role === 'admin' && (
                  <Link href="/admin" className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 rounded transition-colors">
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded p-1 hover:bg-white/10 transition-colors"
                    aria-label="User menu"
                    aria-expanded={dropdownOpen}
                  >
                    <Avatar
                      src={profile?.avatar_url}
                      alt={profile?.display_name ?? profile?.username ?? "User"}
                      size="sm"
                    />
                    <span className="hidden sm:block text-sm font-medium text-gray-300">
                      {profile?.display_name ?? profile?.username}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 rounded shadow-xl border border-gray-700 z-20 py-1 overflow-hidden" style={{ background: "#1e2537" }}>
                        <div className="px-4 py-2 border-b border-gray-700">
                          <p className="text-sm font-medium text-white">{profile?.display_name ?? profile?.username}</p>
                          <p className="text-xs text-gray-400">@{profile?.username}</p>
                        </div>
                        <Link href={`/profile/${profile?.username}`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10">
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <Link href="/messages" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 md:hidden">
                          <MessageSquare className="w-4 h-4" /> Messages
                        </Link>
                        <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10">
                          <Settings className="w-4 h-4" /> Settings
                        </Link>
                        {profile?.role === 'admin' && (
                          <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/10">
                            <Shield className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth/login" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 border border-gray-600 rounded hover:border-gray-400 hover:text-white transition-colors">
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link href="/auth/signup" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white rounded hover:opacity-90 transition-colors" style={{ background: "#2a9d8f" }}>
                  <UserPlus className="w-4 h-4" /> Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded text-gray-400 hover:bg-white/10" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-700 py-3 space-y-2">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="search" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 rounded border border-gray-700 text-sm text-gray-200 placeholder-gray-500 focus:outline-none" style={{ background: "#1e2537" }} />
            </form>
            <div className="flex flex-col gap-1">
              <Link href="/" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link href="/token" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded" onClick={() => setMobileOpen(false)}>Token</Link>
              {user && <Link href="/messages" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded" onClick={() => setMobileOpen(false)}>Messages</Link>}
            </div>
            {!user && (
              <div className="flex gap-2 pt-2">
                <Link href="/auth/login" className="flex-1 text-center py-2 text-sm text-gray-300 border border-gray-600 rounded hover:border-gray-400 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link href="/auth/signup" className="flex-1 text-center py-2 text-sm text-white rounded hover:opacity-90 transition-colors" style={{ background: "#2a9d8f" }} onClick={() => setMobileOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
