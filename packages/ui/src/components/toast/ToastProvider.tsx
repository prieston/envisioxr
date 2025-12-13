"use client";

import React from "react";
import { ToastContainer } from "react-toastify";

/**
 * ToastProvider component that wraps react-toastify's ToastContainer.
 * This component should be placed once in your app's root layout or providers.
 *
 * @example
 * ```tsx
 * import { ToastProvider } from "@klorad/ui";
 *
 * export function AppProviders({ children }) {
 *   return (
 *     <>
 *       {children}
 *       <ToastProvider />
 *     </>
 *   );
 * }
 * ```
 */
export function ToastProvider() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      theme="dark"
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      draggable
    />
  );
}



