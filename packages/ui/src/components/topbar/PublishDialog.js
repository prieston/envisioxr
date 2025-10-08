import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, } from "@mui/material";
export default function PublishDialog({ open, onClose, onConfirm, title = "Publish", description = "Are you sure you want to publish?", confirmLabel = "Publish", cancelLabel = "Cancel", }) {
    const handleConfirm = async () => {
        try {
            await (onConfirm === null || onConfirm === void 0 ? void 0 : onConfirm());
        }
        finally {
            onClose();
        }
    };
    return (_jsxs(Dialog, { open: open, onClose: onClose, children: [_jsx(DialogTitle, { children: title }), _jsx(DialogContent, { children: _jsx(DialogContentText, { children: description }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: onClose, children: cancelLabel }), _jsx(Button, { onClick: handleConfirm, color: "primary", variant: "contained", children: confirmLabel })] })] }));
}
//# sourceMappingURL=PublishDialog.js.map