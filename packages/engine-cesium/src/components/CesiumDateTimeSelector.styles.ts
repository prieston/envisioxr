import { styled } from "@mui/material/styles";
import { Box, Typography, Switch, Slider } from "@mui/material";

export const Container = styled(Box)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(1.5),
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.813rem",
  fontWeight: 600,
  marginBottom: theme.spacing(0.75),
  color: "rgba(51, 65, 85, 0.95)",
  letterSpacing: "0.01em",
}));

export const DateTimeContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

export const StyledSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#2563eb",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#2563eb",
  },
}));

export const GreenSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#10b981",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#10b981",
  },
}));

export const SwitchContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  borderRadius: "8px",
  padding: "8.5px 14px", // Standard input padding
  marginBottom: theme.spacing(1),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  transition: "border-color 0.15s ease",
  "&:hover": {
    borderColor: "rgba(37, 99, 235, 0.4)",
    cursor: "pointer",
  },
}));

export const SwitchLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem", // 12px - control labels
  fontWeight: 400, // Normal weight for labels
  color: "rgba(51, 65, 85, 0.95)",
}));

export const LockToNowContainer = styled(Box)<{ locked: boolean }>(
  ({ locked, theme }) => ({
    backgroundColor: locked
      ? "rgba(16, 185, 129, 0.08)"
      : "rgba(255, 255, 255, 0.8)",
    border: locked
      ? "1px solid rgba(16, 185, 129, 0.3)"
      : "1px solid rgba(226, 232, 240, 0.8)",
    borderRadius: "8px",
    padding: "8.5px 14px", // Standard input padding
    marginBottom: theme.spacing(1.5),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "border-color 0.15s ease, background-color 0.15s ease",
    "&:hover": {
      borderColor: locked
        ? "rgba(16, 185, 129, 0.5)"
        : "rgba(37, 99, 235, 0.4)",
      cursor: "pointer",
    },
  })
);

export const LockToNowLabel = styled(Typography)<{ locked: boolean }>(
  ({ locked }) => ({
    fontSize: "0.75rem", // 12px - control labels
    fontWeight: 400, // Normal weight
    color: locked ? "#10b981" : "rgba(51, 65, 85, 0.95)",
  })
);

export const LockToNowDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem", // 12px - descriptions
  fontWeight: 400,
  color: "rgba(100, 116, 139, 0.85)",
  marginTop: "2px",
  lineHeight: 1.4,
}));

export const CurrentTimeBox = styled(Box)<{ locked: boolean }>(
  ({ locked, theme }) => ({
    marginBottom: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    backgroundColor: locked
      ? "rgba(16, 185, 129, 0.08)"
      : "rgba(37, 99, 235, 0.08)",
    borderRadius: "8px",
    border: locked
      ? "1px solid rgba(16, 185, 129, 0.2)"
      : "1px solid rgba(37, 99, 235, 0.2)",
  })
);

export const CurrentTimeTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.688rem", // 11px - tiny labels
  fontWeight: 600,
  color: "rgba(51, 65, 85, 0.7)",
  marginBottom: theme.spacing(0.5),
  textTransform: "uppercase",
  letterSpacing: "0.05em",
}));

export const LiveBadge = styled("span")(({ theme }) => ({
  marginLeft: theme.spacing(1),
  fontSize: "0.688rem", // 11px - badges
  fontWeight: 600,
  color: "#10b981",
}));

export const CurrentTimeText = styled(Typography)<{ locked: boolean }>(
  ({ locked, theme }) => ({
    fontSize: "0.75rem", // 12px - display text
    fontWeight: 600,
    color: locked ? "#10b981" : "#2563eb",
    fontFamily: "monospace",
    flex: 1,
  })
);

export const InputSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.688rem", // 11px - subsection titles
  fontWeight: 600,
  color: "rgba(51, 65, 85, 0.95)",
  marginBottom: theme.spacing(0.75),
  textTransform: "uppercase",
  letterSpacing: "0.05em",
}));

export const JoystickContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  borderRadius: "8px",
  padding: "14px", // Slightly more padding for the joystick container (has slider inside)
  marginBottom: theme.spacing(1.5),
  transition: "border-color 0.15s ease",
  "&:hover": {
    borderColor: "rgba(37, 99, 235, 0.4)",
  },
}));

export const JoystickTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.688rem", // 11px - subsection title
  fontWeight: 600,
  color: "rgba(51, 65, 85, 0.95)",
  marginBottom: theme.spacing(0.5),
  textTransform: "uppercase",
  letterSpacing: "0.05em",
}));

export const JoystickStatus = styled(Typography)(({ theme }) => ({
  fontSize: "0.688rem", // 11px - status text
  fontWeight: 400,
  color: "rgba(100, 116, 139, 0.85)",
  marginBottom: theme.spacing(1),
  textAlign: "center",
}));

export const JoystickSlider = styled(Slider)<{ joystickValue: number }>(
  ({ joystickValue }) => ({
    color:
      joystickValue === 0
        ? "#64748b"
        : joystickValue > 0
          ? "#2563eb"
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
            ? "#2563eb"
            : "#ef4444",
      "&:hover, &.Mui-focusVisible": {
        boxShadow: `0 0 0 8px ${joystickValue > 0 ? "rgba(37, 99, 235, 0.16)" : "rgba(239, 68, 68, 0.16)"}`,
      },
    },
    "& .MuiSlider-track": {
      border: "none",
      backgroundColor: joystickValue > 0 ? "#2563eb" : "#ef4444",
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
  })
);

export const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    minHeight: "38px",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    fontSize: "0.75rem", // 12px - input text
    "& input": {
      padding: "8.5px 14px", // Standard input padding
    },
    "& fieldset": {
      borderColor: "rgba(226, 232, 240, 0.8)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(37, 99, 235, 0.4)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2563eb",
      borderWidth: "2px",
    },
  },
};

export const selectStyles = {
  minHeight: "38px",
  borderRadius: "8px",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  fontSize: "0.75rem", // 12px - dropdown text
  "& .MuiSelect-select": {
    padding: "8.5px 14px", // Standard input padding
  },
  "& fieldset": {
    borderColor: "rgba(226, 232, 240, 0.8)",
  },
  "&:hover fieldset": {
    borderColor: "rgba(37, 99, 235, 0.4)",
  },
  "&.Mui-focused fieldset": {
    borderColor: "#2563eb",
    borderWidth: "2px",
  },
};

export const menuItemStyles = {
  fontSize: "0.75rem", // 12px - menu items
  "&:hover": {
    backgroundColor: "rgba(37, 99, 235, 0.08)",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(37, 99, 235, 0.12)",
    "&:hover": {
      backgroundColor: "rgba(37, 99, 235, 0.16)",
    },
  },
};

export const playButtonStyles = (locked: boolean) => ({
  color: "#ffffff",
  backgroundColor: locked ? "#94a3b8" : "#2563eb",
  width: "32px",
  height: "32px",
  "&:hover": {
    backgroundColor: locked ? "#94a3b8" : "#1d4ed8",
  },
  cursor: locked ? "not-allowed" : "pointer",
});
