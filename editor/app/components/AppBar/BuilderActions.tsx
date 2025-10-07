"use client";

import React from "react";
import { Typography } from "@mui/material";
import { Save as SaveIcon, Publish as PublishIcon } from "@mui/icons-material";
import { MinimalButton } from "./StyledComponents";
import { showToast } from "@envisio/core/utils";
import { useSceneStore } from "@envisio/core";
import ReportGenerator from "../Report/ReportGenerator";

interface BuilderActionsProps {
  onSave?: () => Promise<void>;
  onPublish: () => void;
}

const BuilderActions: React.FC<BuilderActionsProps> = ({
  onSave,
  onPublish,
}) => {
  const { previewMode } = useSceneStore();

  return (
    <>
      <ReportGenerator disabled={previewMode} />
      <MinimalButton
        onClick={async () => {
          if (onSave) {
            await onSave()
              .then(() => showToast("Saved!"))
              .catch(() => showToast("Error saving."));
          } else {
            showToast("Save action not yet implemented.");
          }
        }}
        disabled={previewMode}
      >
        <SaveIcon />
        <Typography
          sx={{
            fontSize: "0.75rem", // 12px - toolbar labels
            fontWeight: 400, // Normal weight
            letterSpacing: "0.01em",
            lineHeight: 1,
          }}
        >
          Save
        </Typography>
      </MinimalButton>
      <MinimalButton onClick={onPublish} disabled={previewMode}>
        <PublishIcon />
        <Typography
          sx={{
            fontSize: "0.75rem", // 12px - toolbar labels
            fontWeight: 400, // Normal weight
            letterSpacing: "0.01em",
            lineHeight: 1,
          }}
        >
          Publish
        </Typography>
      </MinimalButton>
    </>
  );
};

export default BuilderActions;
