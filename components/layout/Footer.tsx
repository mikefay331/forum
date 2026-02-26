import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-700/50 mt-auto" style={{ background: "#141824" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-white">PumpTalk</span>
            <span className="text-gray-500 text-xs">— Where Degens Talk</span>
          </Link>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} PumpTalk. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
            <Link href="/token" className="hover:text-gray-300 transition-colors">Token</Link>
            <Link href="/search" className="hover:text-gray-300 transition-colors">Search</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
