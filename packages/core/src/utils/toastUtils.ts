import { toast } from "react-toastify";

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
