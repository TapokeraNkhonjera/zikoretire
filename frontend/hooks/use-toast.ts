"use client";

import { useState } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: ToastType, title: string, message?: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration || 5000);
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string) => addToast("success", title, message);
  const error = (title: string, message?: string) => addToast("error", title, message);
  const info = (title: string, message?: string) => addToast("info", title, message);

  const toast = (props: { title: string; description?: string; variant?: "default" | "destructive" }) => {
    const type = props.variant === "destructive" ? "error" : "success";
    addToast(type, props.title, props.description);
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    toast
  };
}
