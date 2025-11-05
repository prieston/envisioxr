import React from "react";
import { Box, Tooltip } from "@mui/material";
import {
  JoystickContainer,
  JoystickTitle,
  JoystickStatus,
  JoystickSlider,
} from "../CesiumDateTimeSelector.styles";

interface TimeJoystickProps {
  value: number;
  disabled: boolean;
  locked: boolean;
  onChange: (value: number) => void;
  onCommit: () => void;
}

export const TimeJoystick: React.FC<TimeJoystickProps> = ({
  value,
  disabled,
  locked,
  onChange,
  onCommit,
}) => {
  return (
    <JoystickContainer>
      <JoystickTitle>Time Scrubber (Joystick)</JoystickTitle>
      <JoystickStatus>
        {value < 0 && "◀ Rewinding"}
        {value > 0 && "Fast Forward ▶"}
        {value === 0 && "Drag to scrub time"}
      </JoystickStatus>
      <Box sx={{ px: 1 }}>
        <Tooltip
          title={
            value === 0
              ? "Paused"
              : `${Math.abs(Math.round((Math.abs(value) / 100) ** 2 * 100))}x speed`
          }
          placement="top"
          arrow
          open={value !== 0}
        >
          <JoystickSlider
            joystickValue={value}
            value={value}
            onChange={(_, val) => onChange(val as number)}
            onChangeCommitted={onCommit}
            min={-100}
            max={100}
            step={1}
            marks={[
              { value: -100, label: "◀◀" },
              { value: -50, label: "◀" },
              { value: 0, label: "⏸" },
              { value: 50, label: "▶" },
              { value: 100, label: "▶▶" },
            ]}
            disabled={disabled || locked}
          />
        </Tooltip>
      </Box>
    </JoystickContainer>
  );
};

