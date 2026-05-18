"use client";

import { useState, useEffect } from "react";

type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Global state
let memoryState: Toast[] = [];
let listeners: ((state: Toast[]) => void)[] = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener(memoryState));
};

export const addToast = (
  type: ToastType, 
  title: string, 
  message?: string, 
  duration?: number,
  action?: { label: string; onClick: () => void }
) => {
  const id = `toast-${Date.now()}-${Math.random()}`;
  const newToast: Toast = { id, type, title, message, duration, action };
  
  memoryState = [...memoryState, newToast];
  notifyListeners();
  
  setTimeout(() => {
    removeToast(id);
  }, duration || 5000);
  
  return id;
};

export const removeToast = (id: string) => {
  memoryState = memoryState.filter(t => t.id !== id);
  notifyListeners();
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(memoryState);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  const success = (title: string, message?: string) => addToast("success", title, message);
  const error = (title: string, message?: string) => addToast("error", title, message);
  const info = (title: string, message?: string) => addToast("info", title, message);

  const toast = (props: { 
    title: string; 
    description?: string; 
    variant?: "default" | "destructive";
    duration?: number;
    action?: { label: string; onClick: () => void };
  }) => {
    const type = props.variant === "destructive" ? "error" : "success";
    addToast(type, props.title, props.description, props.duration, props.action);
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
