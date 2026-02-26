"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let addToastFn: ((msg: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = "info") {
  if (addToastFn) addToastFn(message, type);
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastFn = (message, type) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-[280px] max-w-sm animate-fade-in",
            toast.type === "success" &&
              "bg-green-600 text-white",
            toast.type === "error" && "bg-red-600 text-white",
            toast.type === "info" && "bg-gray-800 text-white dark:bg-gray-700"
          )}
        >
          {toast.type === "success" && <CheckCircle className="w-4 h-4 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.type === "info" && <Info className="w-4 h-4 shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
            className="opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
