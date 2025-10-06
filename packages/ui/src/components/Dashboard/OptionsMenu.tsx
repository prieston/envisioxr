import React from "react";
import { Menu, MenuItem } from "@mui/material";

export interface OptionsMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function OptionsMenu({
  anchorEl,
  open,
  onClose,
  onEdit,
  onDelete,
}: OptionsMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem onClick={onEdit}>Edit</MenuItem>
      <MenuItem onClick={onDelete}>Delete</MenuItem>
    </Menu>
  );
}
