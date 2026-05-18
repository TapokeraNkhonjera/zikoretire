"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastComponent({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case "success":
        return "border-green-200 bg-green-50 text-green-800";
      case "error":
        return "border-red-200 bg-red-50 text-red-800";
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800";
      default:
        return "border-blue-200 bg-blue-50 text-blue-800";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[320px] max-w-[400px] ${getStyles()}`}>
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold">{toast.title}</h4>
          {toast.message && (
            <p className="text-sm mt-1 opacity-90">{toast.message}</p>
          )}
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={() => {
                  toast.action?.onClick();
                  onClose(toast.id);
                }}
                className="text-xs font-medium px-3 py-1.5 rounded-md bg-background/20 hover:bg-background/30 transition-colors"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 ml-2 mt-0.5 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

import { useToast } from "@/hooks/use-toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
        {toasts.map(toast => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </>
  );
}
