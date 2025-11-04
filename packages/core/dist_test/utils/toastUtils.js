"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showToast = void 0;
var react_toastify_1 = require("react-toastify");
// Basic toast utility - no styling
// For styled toasts, import from @envisio/ui instead
var showToast = function (message, type) {
    if (type === void 0) { type = "info"; }
    react_toastify_1.toast[type](message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};
exports.showToast = showToast;
