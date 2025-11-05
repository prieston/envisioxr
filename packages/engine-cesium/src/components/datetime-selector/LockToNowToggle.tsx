import React from "react";
import { Box } from "@mui/material";
import { LockClock } from "@mui/icons-material";
import {
  LockToNowContainer,
  LockToNowLabel,
  LockToNowDescription,
  GreenSwitch,
} from "../CesiumDateTimeSelector.styles";

interface LockToNowToggleProps {
  locked: boolean;
  disabled: boolean;
  onChange: (locked: boolean) => void;
}

export const LockToNowToggle: React.FC<LockToNowToggleProps> = ({
  locked,
  disabled,
  onChange,
}) => {
  return (
    <LockToNowContainer
      locked={locked}
      onClick={() => !disabled && onChange(!locked)}
    >
      <Box>
        <LockToNowLabel locked={locked}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <LockClock fontSize="small" />
            Lock to Real Time
          </Box>
        </LockToNowLabel>
        <LockToNowDescription>Sync with current date & time</LockToNowDescription>
      </Box>
      <GreenSwitch
        checked={locked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        onClick={(e) => e.stopPropagation()}
      />
    </LockToNowContainer>
  );
};

