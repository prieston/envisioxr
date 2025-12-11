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
  icon: false, // Disable default icon since we're using CustomToast with its own icon
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
  // progressStyle is deprecated/removed in v10+
  // We handle styling via className or custom components if needed, or rely on CSS
};

const typeSpecificStyles = {
  success: {
    borderColor: "rgba(34, 197, 94, 0.4)", // Matches CustomToast success color
    "--toastify-color-progress-success": "rgba(34, 197, 94, 1)",
  },
  error: {
    borderColor: "rgba(255, 86, 86, 0.4)", // Matches CustomToast error color
    "--toastify-color-progress-error": "rgba(255, 86, 86, 1)",
  },
  warning: {
    borderColor: "rgba(245, 158, 11, 0.4)", // Matches CustomToast warning color
    "--toastify-color-progress-warning": "rgba(245, 158, 11, 1)",
  },
  info: {
    borderColor: "rgba(107, 156, 216, 0.4)", // Matches CustomToast info color
    "--toastify-color-progress-info": "rgba(107, 156, 216, 1)",
  },
};

const progressBarStyles = {
  success: {
    background:
      "linear-gradient(90deg, rgba(99, 157, 116, 0.8), rgba(99, 157, 116, 1))",
  },
  error: {
    background:
      "linear-gradient(90deg, rgba(185, 131, 131, 0.8), rgba(185, 131, 131, 1))",
  },
  warning: {
    background:
      "linear-gradient(90deg, rgba(179, 149, 99, 0.8), rgba(179, 149, 99, 1))",
  },
  info: {
    background:
      "linear-gradient(90deg, rgba(130, 151, 175, 0.8), rgba(130, 151, 175, 1))",
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
    } as React.CSSProperties, // Cast to CSSProperties to allow CSS variables
    // Manually merge style props for progress bar into style if supported,
    // or ignore since progressStyle is removed.
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
