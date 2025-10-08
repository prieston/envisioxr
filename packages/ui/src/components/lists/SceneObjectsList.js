"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Dialog, DialogTitle, DialogActions, Button, Menu, MenuItem, } from "@mui/material";
import { StyledList, ObjectListItem, StyledListItemText, StyledIconButton, } from "./SceneObjectsList.styles";
import { MoreVert } from "@mui/icons-material";
const SceneObjectsList = ({ items = [], selectedId, onSelect, onDelete, }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItemForDelete, setSelectedItemForDelete] = useState(null);
    const handleMenuOpen = (e, objectId) => {
        e.stopPropagation();
        setMenuAnchor(e.currentTarget);
        setSelectedItemForDelete(objectId);
    };
    const handleMenuClose = () => setMenuAnchor(null);
    const handleDeleteOption = () => {
        handleMenuClose();
        setDeleteDialogOpen(true);
    };
    const confirmDelete = () => {
        if (selectedItemForDelete)
            onDelete === null || onDelete === void 0 ? void 0 : onDelete(selectedItemForDelete);
        setDeleteDialogOpen(false);
        setSelectedItemForDelete(null);
    };
    return (_jsxs(Box, { sx: { width: "100%" }, children: [_jsx(StyledList, { children: items.map((object) => (_jsxs(ObjectListItem, { className: "glass-card", selected: selectedId === object.id, onClick: () => onSelect === null || onSelect === void 0 ? void 0 : onSelect(object.id), children: [_jsx(StyledListItemText, { className: "glass-card-content", primary: object.name || "Untitled Object", secondary: `Type: ${object.type}` }), _jsx(StyledIconButton, { onClick: (e) => handleMenuOpen(e, object.id), size: "small", children: _jsx(MoreVert, {}) })] }, object.id))) }), _jsx(Menu, { anchorEl: menuAnchor, open: Boolean(menuAnchor), onClose: handleMenuClose, sx: {
                    "& .MuiPaper-root": {
                        borderRadius: "8px",
                        border: "1px solid rgba(226, 232, 240, 0.8)",
                        boxShadow: "0 8px 32px rgba(37, 99, 235, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
                    },
                }, children: _jsx(MenuItem, { onClick: handleDeleteOption, sx: {
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "rgba(51, 65, 85, 0.95)",
                        padding: "8px 16px",
                        transition: "background-color 0.15s ease, color 0.15s ease",
                        "&:hover": {
                            backgroundColor: "rgba(239, 68, 68, 0.08)",
                            color: "#ef4444",
                        },
                    }, children: "Delete" }) }), _jsxs(Dialog, { open: deleteDialogOpen, onClose: () => setDeleteDialogOpen(false), PaperProps: {
                    sx: {
                        borderRadius: "12px",
                        padding: "8px",
                        boxShadow: "0 8px 32px rgba(37, 99, 235, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
                    },
                }, children: [_jsx(DialogTitle, { sx: {
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "rgba(51, 65, 85, 0.95)",
                        }, children: "Delete Object?" }), _jsxs(DialogActions, { sx: { padding: "16px" }, children: [_jsx(Button, { onClick: () => setDeleteDialogOpen(false), sx: {
                                    minHeight: "38px",
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    fontWeight: 500,
                                    fontSize: "0.875rem",
                                    color: "rgba(100, 116, 139, 0.85)",
                                    border: "1px solid rgba(226, 232, 240, 0.8)",
                                    padding: "0 16px",
                                    transition: "border-color 0.15s ease, color 0.15s ease",
                                    "&:hover": {
                                        borderColor: "rgba(37, 99, 235, 0.2)",
                                        color: "#2563eb",
                                        backgroundColor: "transparent",
                                    },
                                }, children: "Cancel" }), _jsx(Button, { onClick: confirmDelete, sx: {
                                    minHeight: "38px",
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    backgroundColor: "#ef4444",
                                    color: "#ffffff",
                                    padding: "0 16px",
                                    transition: "background-color 0.15s ease",
                                    "&:hover": {
                                        backgroundColor: "#dc2626",
                                    },
                                }, children: "Delete" })] })] })] }));
};
export default SceneObjectsList;
//# sourceMappingURL=SceneObjectsList.js.map