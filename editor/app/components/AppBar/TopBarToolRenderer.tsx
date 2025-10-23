import React from "react";
import { Typography } from "@mui/material";
import { MinimalButton } from "./StyledComponents";
import { TopBarTool } from "@envisio/core/types";
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
    if (typeof tool.customComponent === "string") {
      const CustomComponent = getComponent(tool.customComponent);
      if (CustomComponent) {
        return <CustomComponent {...tool.customProps} />;
      }
    } else {
      // It's already a React component
      const CustomComponent = tool.customComponent;
      return <CustomComponent {...tool.customProps} />;
    }
    return null;
  }

  // Handle transform and action tools
  if (tool.type === "transform" || tool.type === "action") {
    const IconComponent = tool.icon;

    return (
      <MinimalButton
        active={tool.active}
        onClick={tool.onClick}
        disabled={tool.disabled}
      >
        {IconComponent && <IconComponent />}
        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: 400, // Normal weight
            letterSpacing: "0.01em",
            lineHeight: 1,
          }}
        >
          {tool.label}
        </Typography>
      </MinimalButton>
    );
  }

  return null;
};

export default TopBarToolRenderer;
