"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types/database";
import { showToast } from "@/components/ui/Toast";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

interface Props {
  categories: Category[];
}

export default function AdminCategoryList({ categories: initialCategories }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Category>>({});
  const [newCat, setNewCat] = useState({ name: "", slug: "", description: "", icon: "💬", color: "#2a9d8f", category_group: "", is_admin_only: false });
  const [showNew, setShowNew] = useState(false);
  const supabase = createClient();

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditValues({ name: cat.name, description: cat.description ?? "", icon: cat.icon ?? "", color: cat.color ?? "", category_group: cat.category_group ?? "", is_admin_only: cat.is_admin_only ?? false });
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from("categories").update(editValues).eq("id", id);
    if (error) { showToast("Failed to update category", "error"); return; }
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, ...editValues } as Category : c));
    setEditingId(null);
    showToast("Category updated", "success");
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category? All threads will be deleted.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { showToast("Failed to delete category", "error"); return; }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast("Category deleted", "success");
  };

  const addCategory = async () => {
    if (!newCat.name || !newCat.slug) { showToast("Name and slug required", "error"); return; }
    const { data, error } = await supabase.from("categories").insert({
      name: newCat.name,
      slug: newCat.slug,
      description: newCat.description || null,
      icon: newCat.icon || null,
      color: newCat.color || null,
      category_group: newCat.category_group || null,
      is_admin_only: newCat.is_admin_only,
      sort_order: categories.length + 1,
    }).select().single();
    if (error) { showToast("Failed to add category", "error"); return; }
    setCategories((prev) => [...prev, data as Category]);
    setShowNew(false);
    setNewCat({ name: "", slug: "", description: "", icon: "💬", color: "#2a9d8f", category_group: "", is_admin_only: false });
    showToast("Category added", "success");
  };

  const inputClass = "px-2 py-1 rounded text-sm text-gray-200 border border-gray-700 focus:outline-none focus:border-teal-500";
  const inputStyle = { background: "#1a1f2e" };

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden border border-gray-700/50" style={{ background: "#1e2537" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase hidden sm:table-cell">Group</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase hidden md:table-cell">Admin Only</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  {editingId === cat.id ? (
                    <div className="space-y-1">
                      <input value={editValues.name ?? ""} onChange={(e) => setEditValues((p) => ({ ...p, name: e.target.value }))} className={`w-full ${inputClass}`} style={inputStyle} />
                      <input value={editValues.icon ?? ""} onChange={(e) => setEditValues((p) => ({ ...p, icon: e.target.value }))} placeholder="Icon emoji" className={`w-24 ${inputClass}`} style={inputStyle} />
                      <input value={editValues.color ?? ""} onChange={(e) => setEditValues((p) => ({ ...p, color: e.target.value }))} placeholder="#color" className={`w-24 ${inputClass}`} style={inputStyle} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{cat.name}</p>
                        {cat.description && <p className="text-xs text-gray-400 truncate max-w-xs">{cat.description}</p>}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {editingId === cat.id ? (
                    <input value={editValues.category_group ?? ""} onChange={(e) => setEditValues((p) => ({ ...p, category_group: e.target.value }))} placeholder="Group name" className={`w-32 ${inputClass}`} style={inputStyle} />
                  ) : (
                    <span className="text-xs text-gray-400">{cat.category_group ?? "—"}</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {editingId === cat.id ? (
                    <input
                      type="checkbox"
                      checked={editValues.is_admin_only ?? false}
                      onChange={(e) => setEditValues((p) => ({ ...p, is_admin_only: e.target.checked }))}
                      className="w-4 h-4"
                    />
                  ) : (
                    <span className={`text-xs ${cat.is_admin_only ? "text-red-400" : "text-gray-500"}`}>{cat.is_admin_only ? "Yes" : "No"}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editingId === cat.id ? (
                      <>
                        <button onClick={() => saveEdit(cat.id)} className="text-teal-400 hover:text-teal-300"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-200"><X className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(cat)} className="text-gray-400 hover:text-teal-400"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteCategory(cat.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add new */}
      {showNew ? (
        <div className="rounded-xl p-4 border border-gray-700/50 space-y-3" style={{ background: "#1e2537" }}>
          <h3 className="text-sm font-semibold text-white">New Category</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={newCat.name} onChange={(e) => setNewCat((p) => ({ ...p, name: e.target.value }))} placeholder="Name *" className={`px-3 py-2 rounded text-sm text-gray-200 border border-gray-700 focus:outline-none focus:border-teal-500`} style={inputStyle} />
            <input value={newCat.slug} onChange={(e) => setNewCat((p) => ({ ...p, slug: e.target.value }))} placeholder="Slug *" className={`px-3 py-2 rounded text-sm text-gray-200 border border-gray-700 focus:outline-none focus:border-teal-500`} style={inputStyle} />
            <input value={newCat.description} onChange={(e) => setNewCat((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className={`col-span-2 px-3 py-2 rounded text-sm text-gray-200 border border-gray-700 focus:outline-none focus:border-teal-500`} style={inputStyle} />
            <input value={newCat.icon} onChange={(e) => setNewCat((p) => ({ ...p, icon: e.target.value }))} placeholder="Icon emoji" className={`px-3 py-2 rounded text-sm text-gray-200 border border-gray-700 focus:outline-none focus:border-teal-500`} style={inputStyle} />
            <input value={newCat.color} onChange={(e) => setNewCat((p) => ({ ...p, color: e.target.value }))} placeholder="#color" className={`px-3 py-2 rounded text-sm text-gray-200 border border-gray-700 focus:outline-none focus:border-teal-500`} style={inputStyle} />
            <input value={newCat.category_group} onChange={(e) => setNewCat((p) => ({ ...p, category_group: e.target.value }))} placeholder="Group (optional)" className={`px-3 py-2 rounded text-sm text-gray-200 border border-gray-700 focus:outline-none focus:border-teal-500`} style={inputStyle} />
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={newCat.is_admin_only} onChange={(e) => setNewCat((p) => ({ ...p, is_admin_only: e.target.checked }))} className="w-4 h-4" />
              Admin Only
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={addCategory} className="px-4 py-2 rounded text-sm text-white font-semibold hover:opacity-90" style={{ background: "#2a9d8f" }}>Add Category</button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded text-sm text-gray-400 border border-gray-700 hover:border-gray-500">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded text-sm text-white font-semibold hover:opacity-90" style={{ background: "#2a9d8f" }}>
          <Plus className="w-4 h-4" /> Add Category
        </button>
      )}
    </div>
  );
}
