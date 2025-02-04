"use client";

import React from "react";
import { Box } from "@mui/material";
import LogoHeader from "./LogoHeader";
import BuilderActions from "./BuilderActions";

const AdminAppBar = ({ mode = "builder", onSave, onPublish }) => {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "background.paper",
        color: "text.primary",
        display: "flex",
        height: "64px",
        alignItems: "center",
        justifyContent: "space-between",
        paddingX: 2,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Left Section: Logo */}
      <LogoHeader />
      {mode === "builder" && (
        <BuilderActions onSave={onSave} onPublish={onPublish} />
      )}
    </Box>
  );
};

export default AdminAppBar;
