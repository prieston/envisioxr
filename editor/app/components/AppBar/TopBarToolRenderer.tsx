import React from "react";
import { Typography } from "@mui/material";
import { MinimalButtonActive } from "./StyledComponents";
import { TopBarTool } from "../../types/topBarConfig";
import { getComponent } from "../Builder/ComponentRegistry";

interface TopBarToolRendererProps {
  tool: TopBarTool;
}

const TopBarToolRenderer: React.FC<TopBarToolRendererProps> = ({ tool }) => {
  // Don't render if not visible
  if (tool.visible === false) {
    return null;
  }

  // Handle custom components
  if (tool.type === "custom" && tool.customComponent) {
    const CustomComponent = getComponent(tool.customComponent);
    if (CustomComponent) {
      return <CustomComponent {...tool.customProps} />;
    }
    return null;
  }

  // Handle transform and action tools
  if (tool.type === "transform" || tool.type === "action") {
    const IconComponent = tool.icon;

    return (
      <MinimalButtonActive
        active={tool.active}
        onClick={tool.onClick}
        disabled={tool.disabled}
      >
        {IconComponent && <IconComponent />}
        <Typography variant="caption">{tool.label}</Typography>
      </MinimalButtonActive>
    );
  }

  return null;
};

export default TopBarToolRenderer;
