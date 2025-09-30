import { TopBarConfiguration } from "../types/topBarConfig";
import {
  OpenWith as OpenWithIcon,
  RotateRight as RotateRightIcon,
  AspectRatio as AspectRatioIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
} from "@mui/icons-material";

export const createThreeJSTopBarConfig = (
  selectedObject: any,
  transformMode: "translate" | "rotate" | "scale",
  onTransformModeChange: (mode: "translate" | "rotate" | "scale") => void,
  onSave?: () => Promise<void>,
  onPublish?: () => void,
  previewMode: boolean = false
): TopBarConfiguration => {
  return {
    id: "top-bar",
    name: "Top Bar",
    sections: [
      {
        id: "left-section",
        type: "left",
        tools: [
          {
            id: "logo-header",
            type: "custom",
            label: "Logo",
            customComponent: "LogoHeader",
            customProps: {},
          },
        ],
      },
      {
        id: "center-section",
        type: "center",
        tools: [
          // Transform controls - only visible when object is selected and not in preview mode
          {
            id: "move-tool",
            type: "transform",
            label: "Move",
            icon: OpenWithIcon,
            visible: !!selectedObject && !previewMode,
            active: transformMode === "translate",
            onClick: () => onTransformModeChange("translate"),
          },
          {
            id: "rotate-tool",
            type: "transform",
            label: "Rotate",
            icon: RotateRightIcon,
            visible: !!selectedObject && !previewMode,
            active: transformMode === "rotate",
            onClick: () => onTransformModeChange("rotate"),
          },
          {
            id: "scale-tool",
            type: "transform",
            label: "Scale",
            icon: AspectRatioIcon,
            visible: !!selectedObject && !previewMode,
            active: transformMode === "scale",
            onClick: () => onTransformModeChange("scale"),
          },
        ],
      },
      {
        id: "right-section",
        type: "right",
        tools: [
          {
            id: "report-generator",
            type: "custom",
            label: "Report",
            customComponent: "ReportGenerator",
            customProps: {
              disabled: previewMode,
            },
          },
          {
            id: "save-action",
            type: "action",
            label: "Save",
            icon: SaveIcon,
            disabled: previewMode,
            onClick: async () => {
              if (onSave) {
                await onSave();
              }
            },
          },
          {
            id: "publish-action",
            type: "action",
            label: "Publish",
            icon: PublishIcon,
            disabled: previewMode,
            onClick: () => {
              if (onPublish) {
                onPublish();
              }
            },
          },
        ],
      },
    ],
  };
};

export const createCesiumTopBarConfig = (
  selectedObject: any,
  transformMode: "translate" | "rotate" | "scale",
  onTransformModeChange: (mode: "translate" | "rotate" | "scale") => void,
  onSave?: () => Promise<void>,
  onPublish?: () => void,
  previewMode: boolean = false
): TopBarConfiguration => {
  return {
    id: "top-bar",
    name: "Top Bar",
    sections: [
      {
        id: "left-section",
        type: "left",
        tools: [
          {
            id: "logo-header",
            type: "custom",
            label: "Logo",
            customComponent: "LogoHeader",
            customProps: {},
          },
        ],
      },
      {
        id: "center-section",
        type: "center",
        tools: [
          // Transform controls - only visible when object is selected and not in preview mode
          {
            id: "move-tool",
            type: "transform",
            label: "Move",
            icon: OpenWithIcon,
            visible: !!selectedObject && !previewMode,
            active: transformMode === "translate",
            onClick: () => onTransformModeChange("translate"),
          },
          {
            id: "rotate-tool",
            type: "transform",
            label: "Rotate",
            icon: RotateRightIcon,
            visible: !!selectedObject && !previewMode,
            active: transformMode === "rotate",
            onClick: () => onTransformModeChange("rotate"),
          },
          {
            id: "scale-tool",
            type: "transform",
            label: "Scale",
            icon: AspectRatioIcon,
            visible: !!selectedObject && !previewMode,
            active: transformMode === "scale",
            onClick: () => onTransformModeChange("scale"),
          },
        ],
      },
      {
        id: "right-section",
        type: "right",
        tools: [
          {
            id: "report-generator",
            type: "custom",
            label: "Report",
            customComponent: "ReportGenerator",
            customProps: {
              disabled: previewMode,
            },
          },
          {
            id: "save-action",
            type: "action",
            label: "Save",
            icon: SaveIcon,
            disabled: previewMode,
            onClick: async () => {
              if (onSave) {
                await onSave();
              }
            },
          },
          {
            id: "publish-action",
            type: "action",
            label: "Publish",
            icon: PublishIcon,
            disabled: previewMode,
            onClick: () => {
              if (onPublish) {
                onPublish();
              }
            },
          },
        ],
      },
    ],
  };
};
