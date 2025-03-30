"use client";

import React from "react";
import { Typography } from "@mui/material";
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { MinimalButton } from "./StyledComponents";
import { showToast } from "@/app/utils/toastUtils";

interface BuilderActionsProps {
  onSave?: () => Promise<void>;
  onPublish: () => void;
  onPreview: () => void;
}

const BuilderActions: React.FC<BuilderActionsProps> = ({
  onSave,
  onPublish,
  onPreview,
}) => {
  return (
    <>
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
      >
        <SaveIcon />
        <Typography variant="caption">Save</Typography>
      </MinimalButton>
      <MinimalButton onClick={onPublish}>
        <PublishIcon />
        <Typography variant="caption">Publish</Typography>
      </MinimalButton>
      <MinimalButton onClick={onPreview}>
        <VisibilityIcon />
        <Typography variant="caption">Preview</Typography>
      </MinimalButton>
    </>
  );
};

export default BuilderActions;
