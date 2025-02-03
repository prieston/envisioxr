"use client";
// src/utils/toastUtils.js
import { toast } from 'react-toastify';

export const showToast = (message, type = 'info') => {
  toast[type](message, {
    position: 'bottom-right',
    autoClose: 3500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
