import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Menu, MenuItem } from "@mui/material";
export default function OptionsMenu({ anchorEl, open, onClose, onEdit, onDelete, }) {
    return (_jsxs(Menu, { anchorEl: anchorEl, open: open, onClose: onClose, anchorOrigin: { vertical: "top", horizontal: "right" }, transformOrigin: { vertical: "top", horizontal: "right" }, children: [_jsx(MenuItem, { onClick: onEdit, children: "Edit" }), _jsx(MenuItem, { onClick: onDelete, children: "Delete" })] }));
}
//# sourceMappingURL=OptionsMenu.js.map