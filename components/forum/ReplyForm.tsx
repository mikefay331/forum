"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { Eye, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReplyFormProps {
  threadId: string;
  onReplyAdded?: () => void;
}

export default function ReplyForm({ threadId, onReplyAdded }: ReplyFormProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    if (content.trim().length < 5) {
      setError("Reply must be at least 5 characters");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.from("posts").insert({
      content: content.trim(),
      author_id: user.id,
      thread_id: threadId,
    });

    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Reply posted!", "success");
      setContent("");
      setPreviewMode(false);
      onReplyAdded?.();
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Please{" "}
          <a href="/auth/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            sign in
          </a>{" "}
          to reply to this thread.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Your Reply
        </h4>
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
        <div className="min-h-[120px] p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <p className="text-gray-400 text-sm">Nothing to preview</p>
          )}
        </div>
      ) : (
        <Textarea
          placeholder="Write your reply... Markdown is supported"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={error}
          rows={5}
        />
      )}

      <div className="flex justify-end">
        <Button type="submit" loading={loading} disabled={!content.trim()}>
          Post Reply
        </Button>
      </div>
    </form>
  );
}
