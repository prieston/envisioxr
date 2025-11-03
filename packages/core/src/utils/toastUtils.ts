import { toast } from "react-toastify";

// Basic toast utility - no styling
// For styled toasts, import from @envisio/ui instead
export const showToast = (
  message: string,
  type: keyof typeof toast = "info" as any
) => {
  (toast as any)[type](message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
