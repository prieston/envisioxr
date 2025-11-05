import { styled, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import type { BoxProps } from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { TypographyProps } from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import type { SwitchProps } from "@mui/material/Switch";
import Slider from "@mui/material/Slider";
import type { SliderProps } from "@mui/material/Slider";
import type { ComponentType, HTMLAttributes } from "react";

export type ContainerProps = BoxProps;
const ContainerRoot = styled(Box)<ContainerProps>(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(1.5),
}));
export const Container: ComponentType<ContainerProps> = ContainerRoot;

export type SectionTitleProps = TypographyProps;
const SectionTitleRoot = styled(Typography)<SectionTitleProps>(({ theme }) => ({
  fontSize: "0.813rem",
  fontWeight: 600,
  marginBottom: theme.spacing(0.75),
  color: "rgba(51, 65, 85, 0.95)",
  letterSpacing: "0.01em",
}));
export const SectionTitle: ComponentType<SectionTitleProps> = SectionTitleRoot;

export type DateTimeContainerProps = BoxProps;
const DateTimeContainerRoot = styled(Box)<DateTimeContainerProps>(
  ({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  })
);
export const DateTimeContainer: ComponentType<DateTimeContainerProps> =
  DateTimeContainerRoot;

export type StyledSwitchProps = SwitchProps;
const StyledSwitchRoot = styled(Switch)<StyledSwitchProps>(() => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "var(--color-primary, #6B9CD8)",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "var(--color-primary-600, #4B6FAF)",
  },
}));
export const StyledSwitch =
  StyledSwitchRoot as ComponentType<StyledSwitchProps>;

export type GreenSwitchProps = SwitchProps;
const GreenSwitchRoot = styled(Switch)<GreenSwitchProps>(() => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#10b981",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#10b981",
  },
}));
export const GreenSwitch = GreenSwitchRoot as ComponentType<GreenSwitchProps>;

export type SwitchContainerProps = BoxProps;
const SwitchContainerRoot = styled(Box)<SwitchContainerProps>(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? "#14171A" : "rgba(255, 255, 255, 0.92)",
  border:
    theme.palette.mode === "dark"
      ? "1px solid rgba(255, 255, 255, 0.05)"
      : "1px solid rgba(226, 232, 240, 0.8)",
  borderRadius: 4,
  padding: "8.5px 14px",
  marginBottom: theme.spacing(1),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));
export const SwitchContainer: ComponentType<SwitchContainerProps> =
  SwitchContainerRoot;

export type SwitchLabelProps = TypographyProps;
const SwitchLabelRoot = styled(Typography)<SwitchLabelProps>(({ theme }) => ({
  fontSize: "0.75rem",
  fontWeight: 400,
  color:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.78)"
      : "rgba(51, 65, 85, 0.95)",
}));
export const SwitchLabel: ComponentType<SwitchLabelProps> = SwitchLabelRoot;

export interface LockToNowContainerProps extends BoxProps {
  locked: boolean;
}
const LockToNowContainerRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "locked",
})<LockToNowContainerProps>(({ locked, theme }) => ({
  backgroundColor: locked
    ? alpha("#10b981", theme.palette.mode === "dark" ? 0.18 : 0.12)
    : theme.palette.mode === "dark"
      ? "#14171A"
      : "rgba(255, 255, 255, 0.92)",
  border: locked
    ? `1px solid ${alpha("#10b981", 0.45)}`
    : theme.palette.mode === "dark"
      ? "1px solid rgba(255, 255, 255, 0.05)"
      : "1px solid rgba(226, 232, 240, 0.8)",
  borderRadius: 4,
  padding: "8.5px 14px",
  marginBottom: theme.spacing(1.5),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));
export const LockToNowContainer: ComponentType<LockToNowContainerProps> =
  LockToNowContainerRoot;

export interface LockToNowLabelProps extends TypographyProps {
  locked: boolean;
}
const LockToNowLabelRoot = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "locked",
})<LockToNowLabelProps>(({ locked, theme }) => ({
  fontSize: "0.75rem",
  fontWeight: 400,
  color: locked
    ? "#10b981"
    : theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.78)"
      : "rgba(51, 65, 85, 0.95)",
  display: "block",
}));
export const LockToNowLabel: ComponentType<LockToNowLabelProps> =
  LockToNowLabelRoot;

export type LockToNowDescriptionProps = TypographyProps;
const LockToNowDescriptionRoot = styled(Typography)<LockToNowDescriptionProps>(
  ({ theme }) => ({
    fontSize: "0.75rem",
    fontWeight: 400,
    color:
      theme.palette.mode === "dark"
        ? "rgba(208, 214, 222, 0.7)"
        : "rgba(100, 116, 139, 0.85)",
    marginTop: "2px",
    lineHeight: 1.4,
  })
);
export const LockToNowDescription: ComponentType<LockToNowDescriptionProps> =
  LockToNowDescriptionRoot;

export interface CurrentTimeBoxProps extends BoxProps {
  locked: boolean;
}
const CurrentTimeBoxRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "locked",
})<CurrentTimeBoxProps>(({ locked, theme }) => ({
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  backgroundColor: locked
    ? "rgba(16, 185, 129, 0.08)"
    : alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.12 : 0.08
      ),
  borderRadius: 4,
  border: locked
    ? "1px solid rgba(16, 185, 129, 0.2)"
    : `1px solid ${alpha(theme.palette.primary.main, 0.28)}`,
}));
export const CurrentTimeBox: ComponentType<CurrentTimeBoxProps> =
  CurrentTimeBoxRoot;

export type CurrentTimeTitleProps = TypographyProps;
const CurrentTimeTitleRoot = styled(Typography)<CurrentTimeTitleProps>(
  ({ theme }) => ({
    fontSize: "0.688rem",
    fontWeight: 600,
    color:
      theme.palette.mode === "dark"
        ? "rgba(208, 214, 222, 0.7)"
        : "rgba(51, 65, 85, 0.7)",
    marginBottom: theme.spacing(0.5),
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  })
);
export const CurrentTimeTitle: ComponentType<CurrentTimeTitleProps> =
  CurrentTimeTitleRoot;

export type LiveBadgeProps = HTMLAttributes<HTMLSpanElement>;
const LiveBadgeRoot = styled("span")(({ theme }) => ({
  marginLeft: theme.spacing(1),
  fontSize: "0.688rem",
  fontWeight: 600,
  color: "#10b981",
}));
export const LiveBadge = LiveBadgeRoot as ComponentType<LiveBadgeProps>;

export interface CurrentTimeTextProps extends TypographyProps {
  locked: boolean;
}
const CurrentTimeTextRoot = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "locked",
})<CurrentTimeTextProps>(({ locked, theme }) => ({
  fontSize: "0.75rem",
  fontWeight: 600,
  color: locked ? "#10b981" : theme.palette.primary.dark,
  fontFamily: "monospace",
  flex: 1,
}));
export const CurrentTimeText: ComponentType<CurrentTimeTextProps> =
  CurrentTimeTextRoot;

export type InputSectionTitleProps = TypographyProps;
const InputSectionTitleRoot = styled(Typography)<InputSectionTitleProps>(
  ({ theme }) => ({
    fontSize: "0.688rem",
    fontWeight: 600,
    color: "rgba(51, 65, 85, 0.95)",
    marginBottom: theme.spacing(0.75),
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  })
);
export const InputSectionTitle: ComponentType<InputSectionTitleProps> =
  InputSectionTitleRoot;

export type JoystickContainerProps = BoxProps;
const JoystickContainerRoot = styled(Box)<JoystickContainerProps>(
  ({ theme }) => ({
    backgroundColor:
      theme.palette.mode === "dark" ? "#14171A" : "rgba(255, 255, 255, 0.92)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.05)"
        : "1px solid rgba(226, 232, 240, 0.8)",
    borderRadius: 4,
    padding: "14px",
    marginBottom: theme.spacing(1.5),
  })
);
export const JoystickContainer: ComponentType<JoystickContainerProps> =
  JoystickContainerRoot;

export type JoystickTitleProps = TypographyProps;
const JoystickTitleRoot = styled(Typography)<JoystickTitleProps>(
  ({ theme }) => ({
    fontSize: "0.688rem",
    fontWeight: 600,
    color:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.78)"
        : "rgba(51, 65, 85, 0.95)",
    marginBottom: theme.spacing(0.5),
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  })
);
export const JoystickTitle: ComponentType<JoystickTitleProps> =
  JoystickTitleRoot;

export type JoystickStatusProps = TypographyProps;
const JoystickStatusRoot = styled(Typography)<JoystickStatusProps>(
  ({ theme }) => ({
    fontSize: "0.688rem",
    fontWeight: 400,
    color:
      theme.palette.mode === "dark"
        ? "rgba(208, 214, 222, 0.7)"
        : "rgba(100, 116, 139, 0.85)",
    marginBottom: theme.spacing(1),
    textAlign: "center",
  })
);
export const JoystickStatus: ComponentType<JoystickStatusProps> =
  JoystickStatusRoot;

export interface JoystickSliderProps extends SliderProps {
  joystickValue: number;
}
const JoystickSliderRoot = styled(Slider, {
  shouldForwardProp: (prop) => prop !== "joystickValue",
})<JoystickSliderProps>(({ joystickValue, theme }) => ({
  color:
    joystickValue === 0
      ? theme.palette.mode === "dark"
        ? "rgba(148, 163, 184, 0.7)"
        : "#64748b"
      : joystickValue > 0
        ? theme.palette.primary.dark
        : "#ef4444",
  height: 6,
  "& .MuiSlider-thumb": {
    width: 20,
    height: 20,
    transition: "all 0.15s ease",
    backgroundColor:
      joystickValue === 0
        ? "#94a3b8"
        : joystickValue > 0
          ? "var(--color-primary-600, #4B6FAF)"
          : "#ef4444",
    "&:hover, &.Mui-focusVisible": {
      boxShadow: `0 0 0 8px ${joystickValue > 0 ? "rgba(95, 136, 199, 0.16)" : "rgba(239, 68, 68, 0.16)"}`,
    },
  },
  "& .MuiSlider-track": {
    border: "none",
    backgroundColor:
      joystickValue > 0 ? "var(--color-primary-600, #4B6FAF)" : "#ef4444",
  },
  "& .MuiSlider-rail": {
    opacity: 0.3,
    backgroundColor: "rgba(100, 116, 139, 0.3)",
  },
  "& .MuiSlider-mark": {
    backgroundColor: "rgba(100, 116, 139, 0.4)",
    height: 8,
    width: 2,
  },
  "& .MuiSlider-markLabel": {
    fontSize: "0.7rem",
    color: "rgba(100, 116, 139, 0.85)",
    fontWeight: 600,
  },
}));
export const JoystickSlider =
  JoystickSliderRoot as ComponentType<JoystickSliderProps>;

export const textFieldStyles = (theme: any) => ({
  "& .MuiOutlinedInput-root": {
    minHeight: "38px",
    borderRadius: 4,
    backgroundColor:
      theme.palette.mode === "dark" ? "#14171A" : "rgba(255, 255, 255, 0.92)",
    fontSize: "0.75rem",
    color: theme.palette.mode === "dark" ? "#ffffff" : "rgba(51, 65, 85, 0.95)",
    "& input": {
      padding: "8.5px 14px",
      color: theme.palette.mode === "dark" ? "#ffffff" : "rgba(51, 65, 85, 0.95)",
      "&::placeholder": {
        color:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.5)"
            : "rgba(51, 65, 85, 0.5)",
        opacity: 1,
      },
      // Style the native date/time picker icon (calendar/clock icon)
      "&::-webkit-calendar-picker-indicator": {
        filter: theme.palette.mode === "dark" ? "invert(1) brightness(0.7)" : "brightness(0.5)",
        cursor: "pointer",
        opacity: 0.7,
        "&:hover": {
          opacity: 1,
        },
      },
      // For Firefox
      "&::-moz-calendar-picker-indicator": {
        filter: theme.palette.mode === "dark" ? "invert(1) brightness(0.7)" : "brightness(0.5)",
        cursor: "pointer",
        opacity: 0.7,
        "&:hover": {
          opacity: 1,
        },
      },
    },
    "& .MuiInputAdornment-root": {
      "& .MuiSvgIcon-root": {
        color:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.7)"
            : "rgba(51, 65, 85, 0.7)",
      },
    },
    "& fieldset": {
      borderColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(226, 232, 240, 0.8)",
    },
    "&:hover fieldset": {
      borderColor:
        theme.palette.mode === "dark"
          ? "rgba(95, 136, 199, 0.4)"
          : "rgba(95, 136, 199, 0.6)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "var(--color-primary, #6B9CD8)",
      borderWidth: "2px",
    },
    "&.Mui-disabled": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.05)",
      "& input": {
        color:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.3)"
            : "rgba(51, 65, 85, 0.3)",
      },
      "& .MuiInputAdornment-root .MuiSvgIcon-root": {
        color:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.3)"
            : "rgba(51, 65, 85, 0.3)",
      },
    },
  },
});

export const selectStyles = {
  minHeight: "38px",
  borderRadius: 4,
  backgroundColor: "#14171A",
  fontSize: "0.75rem",
  "& .MuiSelect-select": {
    padding: "8.5px 14px",
  },
  "& fieldset": {
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  "&:hover fieldset": {
    borderColor: "rgba(95, 136, 199, 0.4)",
  },
  "&.Mui-focused fieldset": {
    borderColor: "var(--color-primary, #6B9CD8)",
    borderWidth: "2px",
  },
} as const;

export const menuItemStyles = {
  fontSize: "0.75rem",
  "&:hover": {
    backgroundColor: "rgba(95, 136, 199, 0.08)",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(95, 136, 199, 0.12)",
    "&:hover": {
      backgroundColor: "rgba(95, 136, 199, 0.16)",
    },
  },
} as const;

export const playButtonStyles = (locked: boolean) => ({
  color: "#ffffff",
  backgroundColor: locked ? "#94a3b8" : "var(--color-primary-600, #4B6FAF)",
  width: "32px",
  height: "32px",
  "&:hover": {
    backgroundColor: locked ? "#94a3b8" : "#1d4ed8",
  },
  cursor: locked ? "not-allowed" : "pointer",
});
