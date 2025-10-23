import { TopBarConfiguration } from "../types/topBarConfig";
import {
  OpenWith as OpenWithIcon,
  RotateRight as RotateRightIcon,
  AspectRatio as AspectRatioIcon,
} from "@mui/icons-material";

export const createThreeJSTopBarConfig = (
  selectedObject: any,
  transformMode: "translate" | "rotate" | "scale",
  onTransformModeChange: (mode: "translate" | "rotate" | "scale") => void,
  onSave?: () => Promise<void>,
  onPublish?: () => void,
  previewMode: boolean = false,
  positioningProps?: {
    selectingPosition: boolean;
    setSelectingPosition: (selecting: boolean) => void;
    selectedPosition: [number, number, number] | null;
    setSelectedPosition: (position: [number, number, number] | null) => void;
    pendingModel: any;
    setPendingModel: (model: any) => void;
  }
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
            id: "builder-actions",
            type: "custom",
            label: "Builder Actions",
            customComponent: "BuilderActions",
            customProps: {
              onSave,
              onPublish,
              ...positioningProps,
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
  previewMode: boolean = false,
  positioningProps?: {
    selectingPosition: boolean;
    setSelectingPosition: (selecting: boolean) => void;
    selectedPosition: [number, number, number] | null;
    setSelectedPosition: (position: [number, number, number] | null) => void;
    pendingModel: any;
    setPendingModel: (model: any) => void;
  }
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
            id: "builder-actions",
            type: "custom",
            label: "Builder Actions",
            customComponent: "BuilderActions",
            customProps: {
              onSave,
              onPublish,
              ...positioningProps,
            },
          },
        ],
      },
    ],
  };
};
