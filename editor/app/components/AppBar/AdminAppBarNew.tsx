"use client";

import React, { useState, useMemo } from "react";
import { Divider } from "@mui/material";
import { useSceneStore, useWorldStore } from "@envisio/core";
import { getTopBarConfig } from "@envisio/config/factory";
import TopBarToolRenderer from "./TopBarToolRenderer";
import {
  AppBarContainer,
  ToolbarContainer,
  LeftSection,
  RightSection,
} from "./StyledComponents";
import PublishDialog from "./PublishDialog";
import { showToast } from "@envisio/core/utils";

interface AdminAppBarNewProps {
  mode?: string;
  onSave?: () => Promise<void>;
  onPublish?: () => Promise<void>;
}

const AdminAppBarNew: React.FC<AdminAppBarNewProps> = ({
  mode = "builder",
  onSave,
  onPublish,
}) => {
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const { engine } = useWorldStore();

  const { transformMode, setTransformMode, selectedObject, previewMode } =
    useSceneStore();

  const handleTransformModeChange = (
    mode: "translate" | "rotate" | "scale"
  ) => {
    setTransformMode(mode);
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave();
        showToast("Saved!");
      } catch (error) {
        showToast("Error saving.");
      }
    } else {
      showToast("Save action not yet implemented.");
    }
  };

  const handlePublish = () => {
    setOpenPublishDialog(true);
  };

  // Recreate configuration whenever state changes
  const config = useMemo(() => {
    return getTopBarConfig(
      selectedObject,
      transformMode,
      handleTransformModeChange,
      handleSave,
      handlePublish,
      previewMode
    );
  }, [engine, selectedObject, transformMode, previewMode]);

  if (mode !== "builder") {
    return null;
  }

  const leftSection = config.sections.find(
    (section) => section.type === "left"
  );
  const centerSection = config.sections.find(
    (section) => section.type === "center"
  );
  const rightSection = config.sections.find(
    (section) => section.type === "right"
  );

  return (
    <>
      <AppBarContainer position="fixed" className="glass-panel">
        <ToolbarContainer>
          <LeftSection>
            {leftSection?.tools.map((tool) => (
              <TopBarToolRenderer key={tool.id} tool={tool} />
            ))}
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, height: 24 }}
            />
          </LeftSection>

          <div
            style={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {centerSection?.tools.map((tool) => (
              <TopBarToolRenderer key={tool.id} tool={tool} />
            ))}
          </div>

          <RightSection>
            {rightSection?.tools.map((tool) => (
              <TopBarToolRenderer key={tool.id} tool={tool} />
            ))}
          </RightSection>
        </ToolbarContainer>
      </AppBarContainer>

      <PublishDialog
        open={openPublishDialog}
        onClose={() => setOpenPublishDialog(false)}
        onConfirm={onPublish}
      />
    </>
  );
};

export default AdminAppBarNew;
