"use client";

import { toast } from "react-toastify";

export const showToast = (
  message: string,
  type: "info" | "success" | "warning" | "error" = "info"
) => {
  toast[type](message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};


