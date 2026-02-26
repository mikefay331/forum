"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import type { Category } from "@/lib/types/database";
import { slugify } from "@/lib/utils";
import { Eye, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewThreadFormProps {
  categories: Category[];
  defaultCategoryId?: string;
}

export default function NewThreadForm({
  categories,
  defaultCategoryId,
}: NewThreadFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? "");
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (title.trim().length < 5) errs.title = "Title must be at least 5 characters";
    if (!content.trim()) errs.content = "Content is required";
    if (content.trim().length < 10) errs.content = "Content must be at least 10 characters";
    if (!categoryId) errs.category = "Please select a category";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});

    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const { data, error } = await supabase
      .from("threads")
      .insert({
        title: title.trim(),
        slug,
        content: content.trim(),
        author_id: user.id,
        category_id: categoryId,
      })
      .select("slug")
      .single();

    if (error) {
      showToast(error.message, "error");
      setLoading(false);
      return;
    }

    showToast("Thread created successfully!", "success");
    router.push(`/thread/${data.slug}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Category selector */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a category...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-xs text-red-500">{errors.category}</p>
        )}
      </div>

      {/* Title */}
      <Input
        label="Thread Title"
        placeholder="What's your thread about?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        maxLength={200}
      />

      {/* Content editor */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Content (Markdown supported)
          </label>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={cn(
              "flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border transition-colors",
              previewMode
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
            )}
          >
            {previewMode ? (
              <>
                <Edit className="w-3.5 h-3.5" /> Edit
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" /> Preview
              </>
            )}
          </button>
        </div>

        {previewMode ? (
          <div className="min-h-[200px] p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {content ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className="text-gray-400 text-sm">Nothing to preview</p>
            )}
          </div>
        ) : (
          <Textarea
            placeholder="Write your thread content here... Markdown is supported"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            error={errors.content}
            rows={10}
          />
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create Thread
        </Button>
      </div>
    </form>
  );
}
