import React from "react";
import { Menu, MenuItem } from "@mui/material";

const OptionsMenu = ({ anchorEl, open, onClose, onEdit, onDelete }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <MenuItem onClick={onEdit}>Edit</MenuItem>
      <MenuItem onClick={onDelete}>Delete</MenuItem>
    </Menu>
  );
};

export default OptionsMenu;
