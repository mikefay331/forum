"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { showToast } from "@/components/ui/Toast";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import type { Advertisement } from "@/lib/types/database";

interface Props { ads: Advertisement[]; }

export default function AdminAdvertisements({ ads: initialAds }: Props) {
  const [ads, setAds] = useState(initialAds);
  const [showNew, setShowNew] = useState(false);
  const [newAd, setNewAd] = useState({ title: "", image_url: "", link_url: "", description: "", sort_order: 0 });
  const supabase = createClient();

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("advertisements").update({ is_active: !current }).eq("id", id);
    if (error) { showToast("Failed to update", "error"); return; }
    setAds((prev) => prev.map((a) => a.id === id ? { ...a, is_active: !current } : a));
  };

  const deleteAd = async (id: string) => {
    if (!confirm("Delete this ad?")) return;
    const { error } = await supabase.from("advertisements").delete().eq("id", id);
    if (error) { showToast("Failed to delete", "error"); return; }
    setAds((prev) => prev.filter((a) => a.id !== id));
    showToast("Advertisement deleted", "success");
  };

  const addAd = async () => {
    if (!newAd.title || !newAd.image_url || !newAd.link_url) { showToast("Title, image URL, and link URL required", "error"); return; }
    const { data, error } = await supabase.from("advertisements").insert({
      title: newAd.title,
      image_url: newAd.image_url,
      link_url: newAd.link_url,
      description: newAd.description || null,
      sort_order: newAd.sort_order,
      is_active: true,
    }).select().single();
    if (error) { showToast("Failed to add advertisement", "error"); return; }
    setAds((prev) => [...prev, data as Advertisement]);
    setShowNew(false);
    setNewAd({ title: "", image_url: "", link_url: "", description: "", sort_order: 0 });
    showToast("Advertisement added", "success");
  };

  const inputStyle = { background: "#1a1f2e" };
  const inputClass = "px-3 py-2 rounded text-sm text-gray-200 border border-gray-700 focus:outline-none focus:border-teal-500";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ads.map((ad) => (
          <div key={ad.id} className="rounded-xl overflow-hidden border border-gray-700/50" style={{ background: "#1e2537" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ad.image_url} alt={ad.title} className="w-full h-24 object-cover" />
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{ad.title}</p>
                  {ad.description && <p className="text-xs text-gray-400 mt-0.5">{ad.description}</p>}
                  <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-400 hover:underline mt-1 block truncate max-w-[200px]">{ad.link_url}</a>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(ad.id, ad.is_active)} className={`p-1.5 rounded ${ad.is_active ? "text-teal-400 hover:text-teal-300" : "text-gray-500 hover:text-gray-300"}`}>
                    {ad.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteAd(ad.id)} className="p-1.5 rounded text-gray-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showNew ? (
        <div className="rounded-xl p-4 border border-gray-700/50 space-y-3" style={{ background: "#1e2537" }}>
          <h3 className="text-sm font-semibold text-white">New Advertisement</h3>
          <div className="grid grid-cols-1 gap-3">
            <input value={newAd.title} onChange={(e) => setNewAd((p) => ({ ...p, title: e.target.value }))} placeholder="Title *" className={inputClass} style={inputStyle} />
            <input value={newAd.image_url} onChange={(e) => setNewAd((p) => ({ ...p, image_url: e.target.value }))} placeholder="Image URL *" className={inputClass} style={inputStyle} />
            <input value={newAd.link_url} onChange={(e) => setNewAd((p) => ({ ...p, link_url: e.target.value }))} placeholder="Link URL *" className={inputClass} style={inputStyle} />
            <input value={newAd.description} onChange={(e) => setNewAd((p) => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" className={inputClass} style={inputStyle} />
            <input type="number" value={newAd.sort_order} onChange={(e) => setNewAd((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} placeholder="Sort order" className={inputClass} style={inputStyle} />
          </div>
          <div className="flex gap-2">
            <button onClick={addAd} className="px-4 py-2 rounded text-sm text-white font-semibold hover:opacity-90" style={{ background: "#2a9d8f" }}>Add Ad</button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded text-sm text-gray-400 border border-gray-700 hover:border-gray-500">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded text-sm text-white font-semibold hover:opacity-90" style={{ background: "#2a9d8f" }}>
          <Plus className="w-4 h-4" /> Add Advertisement
        </button>
      )}
    </div>
  );
}
