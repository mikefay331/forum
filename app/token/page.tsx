import { Metadata } from "next";
import { ExternalLink, Zap } from "lucide-react";
import CopyButton from "@/components/ui/CopyButton";

export const metadata: Metadata = { title: "Token | PumpTalk" };

const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

export default function TokenPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <Zap className="w-10 h-10 text-teal-400" />
          <h1 className="text-4xl font-bold text-white">PumpTalk Token</h1>
        </div>
        <p className="text-xl text-gray-300 mb-2">Back to basics — this is how Bitcoin started.</p>
        <p className="text-gray-400 max-w-2xl mx-auto">
          PumpTalk is the community-driven forum for crypto degens. Our token powers the ecosystem,
          giving holders access to exclusive features, reduced fees, and governance rights.
        </p>
      </div>

      {/* Contract Address */}
      <div className="rounded-xl p-6 border border-teal-500/30 mb-8" style={{ background: "#1e2537" }}>
        <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-wider mb-3">Contract Address (CA)</h2>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-sm font-mono text-gray-200 bg-black/30 px-4 py-2.5 rounded border border-gray-700 overflow-x-auto">
            {CONTRACT_ADDRESS}
          </code>
          <CopyButton text={CONTRACT_ADDRESS} />
        </div>
        <p className="text-xs text-gray-500 mt-2">⚠️ Always verify the contract address before purchasing.</p>
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-3 mb-8">
        <a
          href="https://twitter.com/pumptalk"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm text-white hover:opacity-90 transition-colors"
          style={{ background: "#1da1f2" }}
        >
          <ExternalLink className="w-4 h-4" />
          Twitter / X
        </a>
        <a
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm text-white border border-teal-500/50 hover:border-teal-400 transition-colors"
        >
          Back to Forum
        </a>
      </div>

      {/* Tokenomics */}
      <div className="rounded-xl p-6 border border-gray-700/50" style={{ background: "#1e2537" }}>
        <h2 className="text-lg font-bold text-white mb-4">Tokenomics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Total Supply", value: "1,000,000,000", desc: "1 Billion tokens" },
            { label: "Tax", value: "0% / 0%", desc: "Buy / Sell" },
            { label: "Liquidity", value: "Burned", desc: "LP tokens burned" },
            { label: "Ownership", value: "Renounced", desc: "Contract ownership" },
            { label: "Network", value: "Ethereum", desc: "ERC-20 token" },
            { label: "Listings", value: "Uniswap", desc: "DEX listing" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg p-4 border border-gray-700/50" style={{ background: "#232b3e" }}>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-xl font-bold text-white">{item.value}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
