"use client";

import { toast, ToastOptions } from "react-toastify";
import { CustomToast } from "../components/toast/CustomToast";

const defaultToastOptions: ToastOptions = {
  position: "bottom-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  style: {
    background: "rgba(20, 23, 26, 0.95)",
    backdropFilter: "blur(24px) saturate(140%)",
    WebkitBackdropFilter: "blur(24px) saturate(140%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "4px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)",
    color: "#ffffff",
    padding: "16px",
    minHeight: "64px",
  },
  progressStyle: {
    height: "3px",
  },
};

const typeSpecificStyles = {
  success: {
    borderColor: "rgba(34, 197, 94, 0.4)",
  },
  error: {
    borderColor: "rgba(255, 86, 86, 0.4)",
  },
  warning: {
    borderColor: "rgba(245, 158, 11, 0.4)",
  },
  info: {
    borderColor: "rgba(107, 156, 216, 0.4)",
  },
};

export const showToast = (
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
  options?: ToastOptions
) => {
  const mergedOptions: ToastOptions = {
    ...defaultToastOptions,
    ...options,
    style: {
      ...defaultToastOptions.style,
      ...typeSpecificStyles[type],
      ...(options?.style || {}),
    },
  };

  toast[type](<CustomToast message={message} type={type} />, mergedOptions);
};

// Convenience methods
export const toastSuccess = (message: string, options?: ToastOptions) =>
  showToast(message, "success", options);

export const toastError = (message: string, options?: ToastOptions) =>
  showToast(message, "error", options);

export const toastWarning = (message: string, options?: ToastOptions) =>
  showToast(message, "warning", options);

export const toastInfo = (message: string, options?: ToastOptions) =>
  showToast(message, "info", options);

