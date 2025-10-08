import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, } from "@mui/material";
export default function DeleteConfirmationDialog({ open, onCancel, onConfirm, title = "Delete Project", message = "Are you sure you want to delete this project? This action cannot be undone.", confirmLabel = "Delete", cancelLabel = "Cancel", }) {
    return (_jsxs(Dialog, { open: open, onClose: onCancel, children: [_jsx(DialogTitle, { children: title }), _jsx(DialogContent, { children: _jsx(DialogContentText, { children: message }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: onCancel, children: cancelLabel }), _jsx(Button, { onClick: onConfirm, color: "error", children: confirmLabel })] })] }));
}
//# sourceMappingURL=DeleteConfirmationDialog.js.map